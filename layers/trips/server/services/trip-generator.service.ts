import { createOpenAIModel } from "./langchain.service";
import { TripExampleSchemaResponse } from "../schemas";
import { workflow } from "./langgraph.service";

export const getTripExamples = async (query: { lang: string }) => {
  const modelWithStructuredOutput = createOpenAIModel().withStructuredOutput(
    TripExampleSchemaResponse
  );

  const response = await modelWithStructuredOutput.invoke(`
    Generate 3 creative travel trip ideas with a title and a short description in ${query.lang} and an emoji for each title idea
    `);

  return response.ideas;
};

export const tripGenerator = async (tripPrompt: string) => {
  const response = await workflow.invoke({
    prompt: tripPrompt,
  });

  return response;
};
