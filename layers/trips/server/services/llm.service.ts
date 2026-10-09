import { ChatOpenAI } from "@langchain/openai";

const models = new Map<string, ChatOpenAI>();

function chatModel(name: string, effort: "low" | "medium") {
  const key = `${name}:${effort}`;
  let model = models.get(key);
  if (!model) {
    model = new ChatOpenAI({
      model: name,
      apiKey: useRuntimeConfig().openaiApiKey,
      // GPT-5 models reason before answering; the others take no such option.
      ...(name.startsWith("gpt-5") ? { reasoning: { effort } } : {}),
    });
    models.set(key, model);
  }
  return model;
}

// Quick calls: titles, search terms, plan drafts and picks.
export function useChatModel() {
  return chatModel("gpt-4o-mini", "low");
}

// Writes trip itineraries, the call where a better model shows the most. In
// the trip evals (8 scenarios x 2, judged by gpt-5.5) gpt-4.1 beat gpt-4o-mini
// and gpt-5.4-mini on request, places and logistics (2.69 vs 2.06 and 2.5).
export const PLANNER_MODEL = "gpt-4.1";

export function usePlannerModel(name = PLANNER_MODEL) {
  return chatModel(name, "low");
}

// Grades the evals: more capable than any model it grades.
export function useJudgeModel() {
  return chatModel("gpt-5.5", "medium");
}
