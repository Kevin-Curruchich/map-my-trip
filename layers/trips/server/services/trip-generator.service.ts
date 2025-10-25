import { createAgent } from "langchain";
import { createOpenAIModel, googlePlacesTool } from "./langchain.service";
import { TripExampleSchemaResponse, TripPlannerResponse } from "../schemas";

export const getTripExamples = async (query: { lang: string }) => {
  const modelWithStructuredOutput = createOpenAIModel().withStructuredOutput(
    TripExampleSchemaResponse
  );

  const response = await modelWithStructuredOutput.invoke(`
    Generate 3 creative travel trip ideas with a title and a short description in ${query.lang} and an emoji for each title idea
    `);

  return response.ideas;
};

export const tripPlannerChain = async (tripPrompt: string) => {
  const placesTool = googlePlacesTool();

  const tools = [placesTool];

  const agent = createAgent({
    tools,
    responseFormat: TripPlannerResponse,
    prompt: `
    You are a travel assistant that helps users plan trips.
    Given a prompt, you will create a detailed itinerary including activities for each day. 
    Use the Google Places API tool to find popular attractions, restaurants, and points of interest based on the user's preferences. 
    Ensure the itinerary is well-structured and provides a brief description for each activity.
    Based on Places API results, include the place ID for each activity where applicable.
    `,
  });

  const response = await agent.invoke({
    messages: [{ role: "user", content: tripPrompt }],
  });

  return response;
};
