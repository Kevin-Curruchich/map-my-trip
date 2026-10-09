import { z } from "zod";
import { useJudgeModel } from "~~/layers/trips/server/services/llm.service";
import {
  average,
  evalOptions,
  inBatches,
  repeated,
  saveReport,
} from "~~/layers/trips/server/evals/helpers";
import { generateProposalsReport } from "../../services/proposals.service";
import { budgetLabels, formatClock, type CheckedPlan } from "../../services/plan-checks.service";
import { proposalScenarios, type ProposalScenario } from "../../evals/proposal-scenarios";

const budgetRank = { low: 0, medium: 1, high: 2 } as const;

// Scores 1 to 5. OpenAI's strict structured output rejects min/max, so the
// range is in the descriptions.
const JudgeSchema = z.object({
  plans: z.array(
    z.object({
      occasion: z.number().describe("1 a 5: ¿el plan encaja con la ocasión y el grupo?"),
      preferences: z
        .number()
        .describe("1 a 5: ¿toma en cuenta lo que pidió cada persona?"),
      places: z
        .number()
        .describe(
          "1 a 5: ¿cada lugar sirve para lo que dice su paso? Un taller mecánico para comprar botanas es un 1"
        ),
      logistics: z
        .number()
        .describe("1 a 5: ¿horarios, orden y traslados son realistas?"),
      issues: z.array(z.string()).describe("Problemas concretos, en una línea cada uno; vacío si no hay"),
    })
  ),
});

function describePlans(plans: CheckedPlan[]) {
  return plans
    .map((plan, index) => {
      const steps = plan.steps
        .map((step, stepIndex) => {
          const place = step.candidate?.place;
          const where = place
            ? `${place.name} (${[place.address, place.priceLevel ? `precio ${budgetLabels[place.priceLevel]}` : null].filter(Boolean).join(" · ")})`
            : "sin lugar";
          const time = step.time !== null ? formatClock(step.time) : "sin hora";
          return `  ${stepIndex + 1}. ${time} ${step.title}: ${where}`;
        })
        .join("\n");
      return `Plan ${index + 1}: ${plan.title} (presupuesto ${budgetLabels[plan.budget]})\n${plan.description}\n${steps}`;
    })
    .join("\n\n");
}

async function judge(scenario: ProposalScenario, plans: CheckedPlan[]) {
  const people = scenario.participants
    .map((p) => `- ${p.name} (presupuesto ${budgetLabels[p.budget as keyof typeof budgetLabels]}): ${p.preferences ?? "sin preferencias"}`)
    .join("\n");
  const { plans: grades } = await useJudgeModel()
    .withStructuredOutput(JudgeSchema)
    .invoke(
      `
Evalúas planes que una app propuso a un grupo en Guatemala. Sé exigente: un 5 es
un plan que un buen amigo local propondría sin cambiar nada.

Evento: ${scenario.event.title} — ${scenario.event.city}, ${scenario.event.date}
${scenario.event.description ?? ""}
Personas:
${people}

Planes:
${describePlans(plans)}

Califica cada plan, en el mismo orden.
`,
      { runName: "judge-proposals" }
    );
  return grades;
}

async function runScenario(
  { scenario, run }: { scenario: ProposalScenario; run: number },
  maxCorrections: number | undefined
) {
  const started = Date.now();
  try {
    const report = await generateProposalsReport(scenario.event, scenario.participants, {
      maxCorrections,
    });
    const steps = report.plans.flatMap((plan) => plan.steps);
    const lowest = Math.min(
      ...scenario.participants.map((p) => budgetRank[p.budget as keyof typeof budgetRank] ?? 1)
    );
    const grades = await judge(scenario, report.plans);

    return {
      ok: true as const,
      scenario: scenario.name,
      run,
      seconds: Math.round((Date.now() - started) / 1000),
      checks: {
        placesFound: steps.length ? steps.filter((s) => s.candidate).length / steps.length : 0,
        initialProblems: report.initialProblems,
        problemsLeft: report.problems.flat().map((p) => p.message),
        corrections: report.corrections,
        // At least one plan anyone in the group can afford.
        budgetFloor: report.plans.some((plan) => budgetRank[plan.budget] <= lowest),
      },
      grades,
      plans: describePlans(report.plans),
    };
  } catch (error) {
    return { ok: false as const, scenario: scenario.name, run, error: String(error) };
  }
}

// GET /_nitro/tasks/evals:proposals?only=<name part>&repeat=<runs>&corrections=<max>
export default defineTask({
  meta: {
    name: "evals:proposals",
    description: "Generates plans for every scenario, checks them and grades them",
  },
  async run({ payload }) {
    const options = evalOptions(payload);
    const scenarios = proposalScenarios.filter((s) => s.name.includes(options.only));
    const results = await inBatches(repeated(scenarios, options.repeat), 3, (item) =>
      runScenario(item, options.corrections)
    );

    const done = results.flatMap((r) => (r.ok ? [r] : []));
    const grades = done.flatMap((r) => r.grades);
    const summary = {
      ...options,
      runs: results.length,
      errors: results.length - done.length,
      occasion: average(grades.map((g) => g.occasion)),
      preferences: average(grades.map((g) => g.preferences)),
      places: average(grades.map((g) => g.places)),
      logistics: average(grades.map((g) => g.logistics)),
      placesFound: average(done.map((r) => r.checks.placesFound)),
      initialProblems: done.reduce((sum, r) => sum + r.checks.initialProblems, 0),
      problemsLeft: done.reduce((sum, r) => sum + r.checks.problemsLeft.length, 0),
      budgetFloor: `${done.filter((r) => r.checks.budgetFloor).length}/${done.length}`,
      seconds: average(done.map((r) => r.seconds)),
    };

    console.table(
      done.map((r) => ({
        scenario: r.scenario,
        run: r.run,
        occasion: average(r.grades.map((g) => g.occasion)),
        preferences: average(r.grades.map((g) => g.preferences)),
        places: average(r.grades.map((g) => g.places)),
        logistics: average(r.grades.map((g) => g.logistics)),
        found: r.checks.placesFound.toFixed(2),
        problems: `${r.checks.initialProblems} → ${r.checks.problemsLeft.length}`,
        budgetFloor: r.checks.budgetFloor,
      }))
    );
    const file = await saveReport("proposals", { summary, results });
    return { result: { summary, file } };
  },
});
