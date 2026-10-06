import { ChatOpenAI } from "@langchain/openai";

let model: ChatOpenAI | undefined;

export function useChatModel() {
  model ??= new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return model;
}
