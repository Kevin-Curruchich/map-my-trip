import { z } from "zod";
import { eq } from "drizzle-orm";
import { traceable } from "langsmith/traceable";
import { useChatModel } from "~~/layers/trips/server/services/llm.service";
import { eventBudgetValues } from "../../shared/constants/event-options.constant";
import { placeCategoryValues } from "../../shared/constants/place-options.constant";
import type { EventRecord, ParticipantRecord } from "../database/schema";
import { findRecommendedNear, toStepPlace } from "./recommended-places.service";
import {
  budgetLabels,
  checkPlan,
  formatClock,
  MIN_STAY,
  type Candidate,
  type CheckedPlan,
  type PlanProblem,
} from "./plan-checks.service";

// How far from the event we look for places. A picked place or the browser's
// location is precise; a typed name geocodes to the middle of a whole area.
const RADIUS_PRECISE = 4000;
const RADIUS_AREA = 8000;
const CANDIDATES_PER_STEP = 8;
// How many times plans that fail the checks go back to the AI.
const MAX_CORRECTIONS = 2;

// Every property is required (nullable at most): OpenAI's strict structured
// output rejects optional ones.
const DraftSchema = z.object({
  plans: z
    .array(
      z.object({
        title: z.string().describe("Nombre corto del plan, empezando con un emoji"),
        description: z
          .string()
          .describe("Dos frases: qué harán y por qué le sirve a este grupo"),
        budget: z.enum(eventBudgetValues).describe("Costo por persona"),
        steps: z
          .array(
            z.object({
              title: z
                .string()
                .describe("Qué hacen en este paso, corto: 'Desayuno típico'"),
              search: z
                .string()
                .describe(
                  "Búsqueda para encontrar el lugar en Google Maps, en español y sin nombres propios: 'café de especialidad', 'mirador', 'taquería'"
                ),
              category: z.enum(placeCategoryValues),
            })
          )
          .min(2)
          .max(4),
      })
    )
    .length(3),
});

function pickSchema(count: number) {
  return z.object({
    plans: z
      .array(
        z.object({
          title: z.string(),
          description: z
            .string()
            .describe("Dos frases que mencionen los lugares elegidos"),
          budget: z.enum(eventBudgetValues),
          steps: z.array(
            z.object({
              title: z.string(),
              candidate: z
                .string()
                .nullable()
                .describe("Código del lugar elegido de su lista, o null si ninguno sirve"),
              time: z.string().describe("Hora de inicio del paso, en formato 24 h: '19:30'"),
            })
          ),
        })
      )
      .length(count),
  });
}

export interface GeneratedProposal {
  title: string;
  description: string;
  budget: (typeof eventBudgetValues)[number];
  steps: ProposalStep[];
}

type Center = { latitude: number; longitude: number };

// 0 = Sunday, as Google counts. Noon UTC keeps the date on the same day.
function weekdayOf(date: string | null) {
  return date ? new Date(`${date}T12:00:00Z`).getUTCDay() : null;
}

// "19:30" -> minutes after midnight; anything else -> null.
function parseClock(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour < 24 && minute < 60 ? hour * 60 + minute : null;
}

// Where to look for places, saving the coordinates of a typed place so it is
// geocoded only once.
async function resolveCenter(
  event: Pick<EventRecord, "id" | "city" | "latitude" | "longitude">
): Promise<{ center: Center; radius: number } | null> {
  // Coordinates saved before searches were kept to Guatemala are geocoded again.
  if (
    event.latitude !== null &&
    event.longitude !== null &&
    isInGuatemala({ latitude: event.latitude, longitude: event.longitude })
  ) {
    return {
      center: { latitude: event.latitude, longitude: event.longitude },
      radius: RADIUS_PRECISE,
    };
  }

  const center = await geocodeLabel(event.city).catch((error) => {
    console.error("Geocoding the event failed:", error);
    return null;
  });
  if (!center) return null;

  await useDb()
    .update(tables.events)
    .set(center)
    .where(eq(tables.events.id, event.id));
  return { center, radius: RADIUS_AREA };
}

// Recommended places first (partners on top), then Google, without repeats
// and without places closed on the day of the event.
const findCandidates = traceable(async function findCandidates(
  step: { search: string; category: (typeof placeCategoryValues)[number] },
  center: Center,
  radius: number,
  weekday: number | null
): Promise<Candidate[]> {
  const [recommended, google] = await Promise.all([
    findRecommendedNear(step.category, center, radius).catch((error) => {
      console.error("Recommended places lookup failed:", error);
      return [];
    }),
    searchPlacesNear(step.search, center, radius).catch((error) => {
      console.error(`Places search failed for "${step.search}":`, error);
      return [];
    }),
  ]);

  const alsoOnGoogle = new Set(recommended.map((place) => place.googlePlaceId));
  return [
    ...recommended.map((place) => ({ place: toStepPlace(place), hours: null })),
    ...google.filter(
      ({ place, hours }) =>
        !alsoOnGoogle.has(place.id) &&
        !(hours && weekday !== null && hoursOn(hours, weekday) === "cerrado")
    ),
  ].slice(0, CANDIDATES_PER_STEP);
}, { name: "find-candidates", run_type: "tool" });

function describeCandidate(
  code: string,
  { place, hours }: Candidate,
  center: Center,
  weekday: number | null
) {
  const todayHours = hours && weekday !== null ? hoursOn(hours, weekday) : null;
  const details = [
    place.partner ? "ALIADO" : place.source === "recommended" ? "RECOMENDADO" : null,
    place.latitude !== null && place.longitude !== null
      ? `a ${formatDistance(distanceInMeters(center, { latitude: place.latitude, longitude: place.longitude }))}`
      : null,
    todayHours ? `horario ese día: ${todayHours}` : null,
    place.rating ? `${place.rating}★ (${place.ratingCount ?? 0} reseñas)` : null,
    place.priceLevel ? `precio ${budgetLabels[place.priceLevel]}` : null,
    place.description,
  ].filter(Boolean);
  return `    ${code}: ${place.name}${details.length ? ` — ${details.join(" · ")}` : ""}`;
}

export interface ProposalsReport {
  proposals: GeneratedProposal[];
  // The same plans with each step's time and hours, as the checks saw them.
  plans: CheckedPlan[];
  // What the checks found in the first pick, and what is left after correcting.
  initialProblems: number;
  problems: PlanProblem[][];
  corrections: number;
}

type EventInput = Pick<
  EventRecord,
  "id" | "title" | "city" | "date" | "description" | "latitude" | "longitude"
>;
type ParticipantInput = Pick<ParticipantRecord, "name" | "budget" | "preferences">;

export async function generateProposals(
  event: EventInput,
  participants: ParticipantInput[]
): Promise<GeneratedProposal[]> {
  return (await generateProposalsReport(event, participants)).proposals;
}

// The proposals plus what the checks found, for the evals. One LangSmith trace
// per call when tracing is on.
export const generateProposalsReport = traceable(async function generateProposalsReport(
  event: EventInput,
  participants: ParticipantInput[],
  // The evals lower it to compare with fewer corrections.
  { maxCorrections = MAX_CORRECTIONS }: { maxCorrections?: number } = {}
): Promise<ProposalsReport> {
  const people = participants
    .map((participant) => {
      const budget =
        budgetLabels[participant.budget as keyof typeof budgetLabels] ??
        participant.budget;
      const wants = participant.preferences
        ? `quiere: ${participant.preferences}`
        : "no dijo preferencias";
      return `- ${participant.name} (presupuesto ${budget}): ${wants}`;
    })
    .join("\n");

  const context = `Evento: ${event.title}
Zona: ${event.city}
${event.date ? `Fecha: ${formatEventDate(event.date)}` : "Fecha: sin definir"}
${event.description ? `Detalles: ${event.description}` : ""}

Personas y lo que dijeron:
${people}`;

  // 1. The shape of each plan: what kind of place every step needs.
  const [{ plans: drafts }, location] = await Promise.all([
    useChatModel().withStructuredOutput(DraftSchema).invoke(
      `
Ayudas a un grupo de amigos a decidir qué hacer juntos.
Propón 3 planes distintos entre sí para este evento, en español.

${context}

Reglas:
- Cada plan se hace en la zona indicada, en un día o una tarde, con 2 a 4 pasos.
- Para cada paso indica qué tipo de lugar buscar; los lugares concretos se
  eligen después entre resultados reales, así que no inventes nombres.
- Respeta el presupuesto del que menos puede gastar en al menos uno de los planes.
- Combina las preferencias del grupo; no ignores a nadie.
`,
      { runName: "draft-plans" }
    ),
    resolveCenter(event),
  ]);

  if (!location) {
    return {
      proposals: drafts.map((draft) => ({
        ...draft,
        steps: draft.steps.map((step) => ({ title: step.title, place: null })),
      })),
      plans: [],
      initialProblems: 0,
      problems: drafts.map(() => []),
      corrections: 0,
    };
  }

  // 2. Real candidates for every step, one lookup per distinct search.
  const weekday = weekdayOf(event.date);
  const lookups = new Map<string, Promise<Candidate[]>>();
  const candidates = await Promise.all(
    drafts.map((draft) =>
      Promise.all(
        draft.steps.map((step) => {
          const key = `${step.category}:${step.search.toLowerCase()}`;
          if (!lookups.has(key)) {
            lookups.set(
              key,
              findCandidates(step, location.center, location.radius, weekday)
            );
          }
          return lookups.get(key)!;
        })
      )
    )
  );

  // 3. The AI picks among them, by short codes it can't misspell.
  const codes = new Map<string, Candidate>();
  const listings = drafts.map((draft, planIndex) => {
    const steps = draft.steps
      .map((step, stepIndex) => {
        const options = candidates[planIndex]![stepIndex]!.map((candidate, index) => {
          const code = `p${planIndex + 1}s${stepIndex + 1}c${index + 1}`;
          codes.set(code, candidate);
          return describeCandidate(code, candidate, location.center, weekday);
        });
        return `  Paso ${stepIndex + 1}: ${step.title}\n${options.join("\n") || "    (sin lugares encontrados)"}`;
      })
      .join("\n");
    return `Plan ${planIndex + 1}: ${draft.title} (presupuesto ${budgetLabels[draft.budget]})
${draft.description}
${steps}`;
  });

  // The AI's answer for one plan, with only codes from each step's own list.
  function resolvePick(
    planIndex: number,
    picked: z.infer<ReturnType<typeof pickSchema>>["plans"][number] | undefined
  ): CheckedPlan {
    const draft = drafts[planIndex]!;
    let previous: number | null = null;
    return {
      title: picked?.title || draft.title,
      description: picked?.description || draft.description,
      budget: picked?.budget ?? draft.budget,
      steps: draft.steps.map((step, stepIndex) => {
        const choice = picked?.steps[stepIndex];
        const candidate = choice?.candidate ? codes.get(choice.candidate) : undefined;
        let time = choice ? parseClock(choice.time) : null;
        // A step after midnight continues the same night.
        if (time !== null && previous !== null && time < previous && time < 6 * 60) {
          time += 24 * 60;
        }
        if (time !== null) previous = time;
        return {
          title: choice?.title || step.title,
          time,
          candidate:
            candidate && candidates[planIndex]![stepIndex]!.includes(candidate)
              ? candidate
              : null,
        };
      }),
    };
  }

  // For a place closed at its step's time: the step's options open then, so
  // the AI has somewhere to go instead of picking the same place again.
  function openInstead(planIndex: number, problem: PlanProblem) {
    const time = plans[planIndex]?.steps[problem.step]?.time;
    if (weekday === null || time == null) return "";
    const open = candidates[planIndex]![problem.step]!.flatMap((candidate, index) =>
      candidate.hours &&
      isOpenAt(candidate.hours, weekday, time) &&
      isOpenAt(candidate.hours, weekday, time + MIN_STAY)
        ? [`p${planIndex + 1}s${problem.step + 1}c${index + 1}`]
        : []
    );
    return open.length
      ? ` Abiertos a las ${formatClock(time)}: ${open.join(", ")}.`
      : ` Ninguna opción de este paso está abierta a las ${formatClock(time)}: cambia la hora.`;
  }

  // Picks places for some of the plans; `feedback` lists what the checks found
  // in the AI's previous pick for each of them.
  async function pick(planIndexes: number[], feedback?: PlanProblem[][]) {
    const listing = planIndexes
      .map((planIndex, index) => {
        const problems = feedback?.[index] ?? [];
        if (problems.length === 0) return listings[planIndex];
        const lines = problems.map((problem) => {
          const hint =
            problem.kind === "closed" || problem.kind === "closing"
              ? openInstead(planIndex, problem)
              : "";
          return `  - ${problem.message}${hint}`;
        });
        return `${listings[planIndex]}
  Problemas de tu elección anterior para este plan, corrígelos:
${lines.join("\n")}`;
      })
      .join("\n\n");

    const { plans } = await useChatModel()
      .withStructuredOutput(pickSchema(planIndexes.length))
      .invoke(
        `
Ayudas a un grupo de amigos a decidir qué hacer juntos.

${context}

Estos son planes con lugares reales cerca para cada paso. Cada lugar dice a
qué distancia está del punto del evento y, si se sabe, su horario ese día:

${listing}

Para cada plan, en el mismo orden en que aparecen y con los mismos pasos:
- Elige un lugar por paso usando su código, o null si ninguno encaja.
- Indica a qué hora empieza cada paso, en orden y con tiempo razonable entre uno
  y otro.
- Elige lugares abiertos a esa hora y por lo menos una hora después.
- Respeta el presupuesto del plan y lo que pidió el grupo.
- Prefiere los lugares RECOMENDADO y ALIADO cuando encajen con el grupo; si no
  encajan, elige otro. Entre los demás, prefiere los mejor calificados.
- No repitas un mismo lugar dentro de un plan. Prefiere lugares cercanos al punto
  del evento, para que los pasos queden cerca entre sí.
- Si un plan trae problemas de tu elección anterior, corrígelos todos.
- Reescribe la descripción mencionando los lugares elegidos. En español.
`,
        { runName: feedback ? "correct-plans" : "pick-places" }
      );
    return planIndexes.map((planIndex, index) => resolvePick(planIndex, plans[index]));
  }

  // 4. Checks in code; plans that fail go back to the AI with what failed.
  const limits = { weekday, maxHop: location.radius };
  const plans = await pick(drafts.map((_, planIndex) => planIndex));
  const problems = plans.map((plan) => checkPlan(plan, limits));
  const initialProblems = problems.flat().length;

  let corrections = 0;
  while (corrections < maxCorrections) {
    const failing = problems.flatMap((found, planIndex) => (found.length ? [planIndex] : []));
    if (failing.length === 0) break;
    corrections++;

    const retried = await pick(
      failing,
      failing.map((planIndex) => problems[planIndex]!)
    ).catch((error) => {
      console.error("Correcting the plans failed:", error);
      return null;
    });
    if (!retried) break;

    // A correction is kept only when it leaves fewer problems.
    failing.forEach((planIndex, index) => {
      const found = checkPlan(retried[index]!, limits);
      if (found.length < problems[planIndex]!.length) {
        plans[planIndex] = retried[index]!;
        problems[planIndex] = found;
      }
    });
  }

  if (problems.some((found) => found.length)) {
    console.warn("Plans still fail some checks:", problems.flat().map((p) => p.message));
  }

  return {
    proposals: plans.map((plan, planIndex) => {
      // A place that is closed or repeated is worse than no place.
      const dropped = new Set(
        problems[planIndex]!
          .filter((problem) => problem.kind === "closed" || problem.kind === "repeated")
          .map((problem) => problem.step)
      );
      return {
        title: plan.title,
        description: plan.description,
        budget: plan.budget,
        steps: plan.steps.map((step, stepIndex) => ({
          title: step.title,
          place: dropped.has(stepIndex) ? null : (step.candidate?.place ?? null),
        })),
      };
    }),
    plans,
    initialProblems,
    problems,
    corrections,
  };
}, { name: "generate-proposals", run_type: "chain" });
