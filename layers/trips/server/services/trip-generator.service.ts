import { createOpenAIModel } from "./langchain.service";
import { TripExampleSchemaResponse } from "../schemas";
import { workflow } from "./langgraph.service";

export const getTripExamples = async (query: { lang: string }) => {
  const modelWithStructuredOutput = createOpenAIModel().withStructuredOutput(
    TripExampleSchemaResponse
  );

  const response = await modelWithStructuredOutput.invoke(`
    Generate 3 creative travel trip ideas with a title and a short description in ${query.lang} and an emoji for each title idea
    The short description should be no more than 20 words and needs to include how long(1-2 days, 3-4 days or 5-7 days), how many people (solo travel, couple, small group (3-4) or family (5-6)), and the price range
    (Budget-friendly, Mid-range, Luxury) for each trip idea.
    `);

  return response.ideas;
};

export const tripGenerator = async (tripPrompt: string) => {
  const response = await workflow.invoke({
    prompt: tripPrompt,
  });

  return response;
};
