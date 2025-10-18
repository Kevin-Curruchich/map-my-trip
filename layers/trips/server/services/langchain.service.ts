import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { z } from "zod";

import { TripExampleSchemaResponse, TripPlannerResponse } from "../schemas";

const createGooglePlacesTool = () => {
  const googlePlacesApi = new GooglePlacesAPI({
    apiKey: useRuntimeConfig().googlePlacesApiKey,
  });

  return tool(
    async ({ input }: { input: string }) => {
      // Use the GooglePlacesAPI tool directly
      return await googlePlacesApi.invoke(input);
    },
    {
      name: "google_places",
      description:
        "Search for places, attractions, restaurants, and points of interest using Google Places API. Useful for finding specific locations, popular attractions, restaurants, hotels, and other places of interest.",
      schema: z.object({
        input: z
          .string()
          .describe(
            "The search query for places (e.g., 'restaurants in Paris', 'tourist attractions in Tokyo', 'hotels near Times Square')"
          ),
      }),
    }
  );
};

export const createOpenAIModel = () => {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: useRuntimeConfig().openaiApiKey,
  });

  return llm;
};

export const tripPlannerChain = async (tripPrompt: string) => {
  const googlePlacesTool = createGooglePlacesTool();

  const tools = [googlePlacesTool];

  const agent = createAgent({
    llm: createOpenAIModel(),
    tools,
    responseFormat: TripPlannerResponse,
    prompt: `You are a travel assistant that helps users plan trips. Given a prompt, you will create a detailed itinerary including activities for each day. Use the Google Places API tool to find popular attractions, restaurants, and points of interest based on the user's preferences. Ensure the itinerary is well-structured and provides a brief description for each activity.`,
  });

  const response = await agent.invoke({
    messages: [{ role: "user", content: tripPrompt }],
  });

  return response;
};

export const getTripExamples = async (query: { lang: string }) => {
  const modelWithStructuredOutput = createOpenAIModel().withStructuredOutput(
    TripExampleSchemaResponse
  );

  const response = await modelWithStructuredOutput.invoke(`
    Generate 3 creative travel trip ideas with a title and a short description in ${query.lang} and an emoji for each title idea
    `);

  return response.ideas;
};
