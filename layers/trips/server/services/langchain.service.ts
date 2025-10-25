import { tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { z } from "zod";

export const googlePlacesTool = () => {
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
