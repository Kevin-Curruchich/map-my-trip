import { z } from "zod";
import { eq } from "drizzle-orm";
import { useChatModel } from "~~/layers/trips/server/services/llm.service";
import { eventBudgetValues } from "../../shared/constants/event-options.constant";
import { placeCategoryValues } from "../../shared/constants/place-options.constant";
import type { EventRecord, ParticipantRecord } from "../database/schema";
import { findRecommendedNear, toStepPlace } from "./recommended-places.service";

const budgetLabels = {
  low: "económico",
  medium: "normal",
  high: "sin límite",
} as const;

// How far from the event we look for places. A picked place or the browser's
// location is precise; a typed name geocodes to the middle of a whole area.
const RADIUS_PRECISE = 4000;
const RADIUS_AREA = 8000;
const CANDIDATES_PER_STEP = 8;

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

const PickSchema = z.object({
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
          })
        ),
      })
    )
    .length(3),
});

export interface GeneratedProposal {
  title: string;
  description: string;
  budget: (typeof eventBudgetValues)[number];
  steps: ProposalStep[];
}

type Center = { latitude: number; longitude: number };

// Where to look for places, saving the coordinates of a typed place so it is
// geocoded only once.
async function resolveCenter(
  event: Pick<EventRecord, "id" | "city" | "latitude" | "longitude">
): Promise<{ center: Center; radius: number } | null> {
  if (event.latitude !== null && event.longitude !== null) {
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

// Recommended places first (partners on top), then Google, without repeats.
async function findCandidates(
  step: { search: string; category: (typeof placeCategoryValues)[number] },
  center: Center,
  radius: number
): Promise<StepPlace[]> {
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
    ...recommended.map(toStepPlace),
    ...google.filter((place) => !alsoOnGoogle.has(place.id)),
  ].slice(0, CANDIDATES_PER_STEP);
}

function describeCandidate(code: string, place: StepPlace) {
  const details = [
    place.partner ? "ALIADO" : place.source === "recommended" ? "RECOMENDADO" : null,
    place.rating ? `${place.rating}★ (${place.ratingCount ?? 0} reseñas)` : null,
    place.priceLevel ? `precio ${budgetLabels[place.priceLevel]}` : null,
    place.description,
  ].filter(Boolean);
  return `    ${code}: ${place.name}${details.length ? ` — ${details.join(" · ")}` : ""}`;
}

export async function generateProposals(
  event: Pick<
    EventRecord,
    "id" | "title" | "city" | "date" | "description" | "latitude" | "longitude"
  >,
  participants: Pick<ParticipantRecord, "name" | "budget" | "preferences">[]
): Promise<GeneratedProposal[]> {
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
${event.date ? `Fecha: ${event.date}` : "Fecha: sin definir"}
${event.description ? `Detalles: ${event.description}` : ""}

Personas y lo que dijeron:
${people}`;

  // 1. The shape of each plan: what kind of place every step needs.
  const [{ plans: drafts }, location] = await Promise.all([
    useChatModel().withStructuredOutput(DraftSchema).invoke(`
Ayudas a un grupo de amigos a decidir qué hacer juntos.
Propón 3 planes distintos entre sí para este evento, en español.

${context}

Reglas:
- Cada plan se hace en la zona indicada, en un día o una tarde, con 2 a 4 pasos.
- Para cada paso indica qué tipo de lugar buscar; los lugares concretos se
  eligen después entre resultados reales, así que no inventes nombres.
- Respeta el presupuesto del que menos puede gastar en al menos uno de los planes.
- Combina las preferencias del grupo; no ignores a nadie.
`),
    resolveCenter(event),
  ]);

  if (!location) {
    return drafts.map((draft) => ({
      ...draft,
      steps: draft.steps.map((step) => ({ title: step.title, place: null })),
    }));
  }

  // 2. Real candidates for every step, one lookup per distinct search.
  const lookups = new Map<string, Promise<StepPlace[]>>();
  const candidates = await Promise.all(
    drafts.map((draft) =>
      Promise.all(
        draft.steps.map((step) => {
          const key = `${step.category}:${step.search.toLowerCase()}`;
          if (!lookups.has(key)) {
            lookups.set(key, findCandidates(step, location.center, location.radius));
          }
          return lookups.get(key)!;
        })
      )
    )
  );

  // 3. The AI picks among them, by short codes it can't misspell.
  const codes = new Map<string, StepPlace>();
  const listing = drafts
    .map((draft, planIndex) => {
      const steps = draft.steps
        .map((step, stepIndex) => {
          const options = candidates[planIndex]![stepIndex]!.map((place, index) => {
            const code = `p${planIndex + 1}s${stepIndex + 1}c${index + 1}`;
            codes.set(code, place);
            return describeCandidate(code, place);
          });
          return `  Paso ${stepIndex + 1}: ${step.title}\n${options.join("\n") || "    (sin lugares encontrados)"}`;
        })
        .join("\n");
      return `Plan ${planIndex + 1}: ${draft.title} (presupuesto ${budgetLabels[draft.budget]})
${draft.description}
${steps}`;
    })
    .join("\n\n");

  const { plans } = await useChatModel().withStructuredOutput(PickSchema).invoke(`
Ayudas a un grupo de amigos a decidir qué hacer juntos.

${context}

Estos son 3 planes con lugares reales cerca para cada paso:

${listing}

Para cada plan, en el mismo orden y con los mismos pasos:
- Elige un lugar por paso usando su código, o null si ninguno encaja.
- Respeta el presupuesto del plan y lo que pidió el grupo.
- Prefiere los lugares RECOMENDADO y ALIADO cuando encajen con el grupo; si no
  encajan, elige otro. Entre los demás, prefiere los mejor calificados.
- No repitas un mismo lugar dentro de un plan y procura que estén cerca entre sí.
- Reescribe la descripción mencionando los lugares elegidos. En español.
`);

  return drafts.map((draft, planIndex) => {
    const picked = plans[planIndex];
    return {
      title: picked?.title || draft.title,
      description: picked?.description || draft.description,
      budget: picked?.budget ?? draft.budget,
      steps: draft.steps.map((step, stepIndex) => {
        const choice = picked?.steps[stepIndex];
        const place = choice?.candidate ? codes.get(choice.candidate) : undefined;
        // Only codes from this step count; anything else means no place.
        const valid =
          place && candidates[planIndex]![stepIndex]!.includes(place) ? place : null;
        return { title: choice?.title || step.title, place: valid };
      }),
    };
  });
}
