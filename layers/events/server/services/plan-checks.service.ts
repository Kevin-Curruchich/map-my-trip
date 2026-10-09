import type { eventBudgetValues } from "../../shared/constants/event-options.constant";

type Budget = (typeof eventBudgetValues)[number];

export const budgetLabels = {
  low: "económico",
  medium: "normal",
  high: "sin límite",
} as const;

// A step should stay open at least this long after it starts.
export const MIN_STAY = 60;

// A place the AI may pick for a step, with its hours from Google when known.
export type Candidate = { place: StepPlace; hours: OpeningHours | null };

export interface CheckedStep {
  title: string;
  // Minutes after midnight of the event's day; past 24:00 for the same night.
  time: number | null;
  candidate: Candidate | null;
}

export interface CheckedPlan {
  title: string;
  description: string;
  budget: Budget;
  steps: CheckedStep[];
}

// `closed` and `repeated` steps lose their place when the AI can't fix them.
export interface PlanProblem {
  kind: "closed" | "closing" | "repeated" | "far" | "budget" | "order";
  step: number;
  // In Spanish: it goes back to the AI as is.
  message: string;
}

export function formatClock(minutes: number) {
  const inDay = minutes % (24 * 60);
  return `${String(Math.floor(inDay / 60)).padStart(2, "0")}:${String(inDay % 60).padStart(2, "0")}`;
}

// What code can tell is wrong with a plan: places closed at their step's time,
// repeated, too far from the step before, or expensive in a plan that isn't.
export function checkPlan(
  plan: CheckedPlan,
  { weekday, maxHop }: { weekday: number | null; maxHop: number }
): PlanProblem[] {
  const problems: PlanProblem[] = [];
  const seen = new Map<string, number>();

  plan.steps.forEach((step, index) => {
    const n = index + 1;
    const previous = plan.steps[index - 1];

    if (step.time !== null && previous?.time != null && step.time <= previous.time) {
      problems.push({
        kind: "order",
        step: index,
        message: `El paso ${n} empieza a las ${formatClock(step.time)}, no después del paso ${n - 1} (${formatClock(previous.time)}).`,
      });
    }

    if (!step.candidate) return;
    const { place, hours } = step.candidate;

    const first = seen.get(place.id);
    if (first !== undefined) {
      problems.push({
        kind: "repeated",
        step: index,
        message: `Paso ${n}: ${place.name} ya está en el paso ${first + 1}.`,
      });
    } else {
      seen.set(place.id, index);
    }

    if (hours && weekday !== null && step.time !== null) {
      const schedule = `horario ese día: ${hoursOn(hours, weekday)}`;
      if (isOpenAt(hours, weekday, step.time) === false) {
        problems.push({
          kind: "closed",
          step: index,
          message: `Paso ${n}: ${place.name} está cerrado a las ${formatClock(step.time)} (${schedule}).`,
        });
      } else if (isOpenAt(hours, weekday, step.time + MIN_STAY) === false) {
        problems.push({
          kind: "closing",
          step: index,
          message: `Paso ${n}: ${place.name} cierra menos de una hora después de las ${formatClock(step.time)} (${schedule}).`,
        });
      }
    }

    // Only expensive places count: Google marks most cheap places in Guatemala
    // as moderate, so moderate fits any budget.
    if (place.priceLevel === "high" && plan.budget !== "high") {
      problems.push({
        kind: "budget",
        step: index,
        message: `Paso ${n}: ${place.name} tiene precio ${budgetLabels[place.priceLevel]} y el plan es ${budgetLabels[plan.budget]}.`,
      });
    }

    const before = previous?.candidate?.place;
    if (
      before?.latitude != null &&
      before.longitude != null &&
      place.latitude !== null &&
      place.longitude !== null
    ) {
      const distance = distanceInMeters(
        { latitude: before.latitude, longitude: before.longitude },
        { latitude: place.latitude, longitude: place.longitude }
      );
      if (distance > maxHop) {
        problems.push({
          kind: "far",
          step: index,
          message: `Pasos ${n - 1} y ${n}: ${before.name} y ${place.name} están a ${formatDistance(distance)}; que no pasen de ${formatDistance(maxHop)}.`,
        });
      }
    }
  });

  return problems;
}
