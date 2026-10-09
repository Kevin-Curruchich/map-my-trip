import { ChatOpenAI } from "@langchain/openai";

let model: ChatOpenAI | undefined;

export function useChatModel() {
  model ??= new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return model;
}

let judge: ChatOpenAI | undefined;

// Grades the evals: a larger model than the one being graded, and steady.
export function useJudgeModel() {
  judge ??= new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return judge;
}
