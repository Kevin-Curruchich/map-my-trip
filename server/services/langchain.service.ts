import { ChatOpenAI } from "@langchain/openai";

export class LangChainService {
  private static instance: LangChainService;
  private models: Map<string, ChatOpenAI> = new Map();

  private constructor() {}

  static getInstance(): LangChainService {
    if (!LangChainService.instance) {
      LangChainService.instance = new LangChainService();
    }
    return LangChainService.instance;
  }

  getTripPlannerModel(): ChatOpenAI {
    const key = "trip-planner";

    if (!this.models.has(key)) {
      const model = new ChatOpenAI({
        model: "gpt-4",
        temperature: 0.7,
        openAIApiKey: useRuntimeConfig().openaiApiKey,
        maxRetries: 3,
        timeout: 30000,
      });

      this.models.set(key, model);
    }

    return this.models.get(key)!;
  }
}
