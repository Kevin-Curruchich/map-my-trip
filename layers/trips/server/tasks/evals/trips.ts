import { z } from "zod";
import { useJudgeModel } from "../../services/llm.service";
import { tripGraph } from "../../services/trip-graph.service";
import { average, inBatches, saveReport } from "../../evals/helpers";
import { tripScenarios } from "../../evals/trip-scenarios";

// Two stops on the same day further apart than this need a car and a plan.
const FAR_HOP = 15_000;

// Scores 1 to 5. OpenAI's strict structured output rejects min/max, so the
// range is in the descriptions.
const JudgeSchema = z.object({
  request: z.number().describe("1 to 5: does it do what the trip idea asked?"),
  places: z.number().describe("1 to 5: is every place right for its activity?"),
  logistics: z
    .number()
    .describe("1 to 5: are times, order and travel between places realistic?"),
  issues: z.array(z.string()).describe("Concrete problems, one line each; empty if none"),
});

async function runScenario(scenario: (typeof tripScenarios)[number]) {
  const started = Date.now();
  try {
    const state = await tripGraph.invoke({ prompt: scenario.prompt }, { runName: "generate-trip" });
    const places = new Map((state.places ?? []).map((place) => [place.id, place]));
    const days = state.itinerary ?? [];
    const activities = days.flatMap((day) => day.activities);

    // Longest same-day hop between consecutive activities with a place.
    const hops = days.flatMap((day) => {
      const located = day.activities.flatMap((a) => {
        const place = a.placeId ? places.get(a.placeId) : undefined;
        return place?.latitude != null && place.longitude != null
          ? [{ latitude: place.latitude, longitude: place.longitude }]
          : [];
      });
      return located.slice(1).map((point, index) => distanceInMeters(located[index]!, point));
    });

    const itinerary = days
      .map(
        (day) =>
          `Day ${day.day}\n${day.activities
            .map((a) => `  ${a.time} ${a.name} — ${a.placeId ? (places.get(a.placeId)?.name ?? "?") : "no place"} (${a.duration})`)
            .join("\n")}`
      )
      .join("\n");

    const grade = await useJudgeModel()
      .withStructuredOutput(JudgeSchema)
      .invoke(
        `
You grade trip itineraries an app made for Guatemala. Be demanding: a 5 is an
itinerary a good local guide would hand over unchanged.

Trip idea: ${scenario.prompt}
Destination found: ${state.destination}

${itinerary}
`,
        { runName: "judge-trip" }
      );

    return {
      ok: true as const,
      scenario: scenario.name,
      seconds: Math.round((Date.now() - started) / 1000),
      checks: {
        withPlace: activities.length
          ? activities.filter((a) => a.placeId).length / activities.length
          : 0,
        // Ids not in the searched places: always 0 since places go by code.
        unknownPlaces: activities.filter((a) => a.placeId && !places.has(a.placeId)).length,
        longestHop: hops.length ? formatDistance(Math.max(...hops)) : null,
        farHops: hops.filter((hop) => hop > FAR_HOP).length,
        initialProblems: state.initialProblems ?? 0,
        problemsLeft: (state.problems ?? []).map((problem) => problem.message),
        corrections: state.corrections ?? 0,
      },
      grade,
      itinerary,
    };
  } catch (error) {
    return { ok: false as const, scenario: scenario.name, error: String(error) };
  }
}

// GET /_nitro/tasks/evals:trips?only=<part of a scenario name>
export default defineTask({
  meta: {
    name: "evals:trips",
    description: "Generates a trip for every scenario, checks it and grades it",
  },
  async run({ payload }) {
    const only = typeof payload.only === "string" ? payload.only : "";
    const scenarios = tripScenarios.filter((s) => s.name.includes(only));
    const results = await inBatches(scenarios, 2, runScenario);

    const done = results.flatMap((r) => (r.ok ? [r] : []));
    const summary = {
      scenarios: results.length,
      errors: results.length - done.length,
      request: average(done.map((r) => r.grade.request)),
      places: average(done.map((r) => r.grade.places)),
      logistics: average(done.map((r) => r.grade.logistics)),
      withPlace: average(done.map((r) => r.checks.withPlace)),
      unknownPlaces: done.reduce((sum, r) => sum + r.checks.unknownPlaces, 0),
      farHops: done.reduce((sum, r) => sum + r.checks.farHops, 0),
      initialProblems: done.reduce((sum, r) => sum + r.checks.initialProblems, 0),
      problemsLeft: done.reduce((sum, r) => sum + r.checks.problemsLeft.length, 0),
      seconds: average(done.map((r) => r.seconds)),
    };

    console.table(
      done.map((r) => ({
        scenario: r.scenario,
        request: r.grade.request,
        places: r.grade.places,
        logistics: r.grade.logistics,
        withPlace: r.checks.withPlace.toFixed(2),
        longestHop: r.checks.longestHop,
        farHops: r.checks.farHops,
        problems: `${r.checks.initialProblems} → ${r.checks.problemsLeft.length}`,
      }))
    );
    const file = await saveReport("trips", { summary, results });
    return { result: { summary, file } };
  },
});
