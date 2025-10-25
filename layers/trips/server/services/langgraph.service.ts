import { z } from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";

import { createOpenAIModel, googlePlacesTool } from "./langchain.service";

const llm = createOpenAIModel();
const placesTool = googlePlacesTool();

const InputState = z.object({
  prompt: z
    .string()
    .min(10)
    .max(500)
    .describe("The user's prompt for the trip itinerary"),
});

const OutputState = z
  .object({
    title: z.string(),
    description: z.string(),
    itinerary: z.array(
      z.object({
        day: z.number(),
        activities: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            activityType: z.enum([
              "eat",
              "shop",
              "visit",
              "exercise",
              "relax",
              "explore",
              "learn",
            ]),
            location: z.string().describe("Location of the activity"),
            placeId: z
              .string()
              .describe("Google Place ID of the activity location"),
          })
        ),
      })
    ),
  })
  .register(registry, {
    reducer: {
      fn: (x, y) => ({ ...x, ...y }),
    },
  });

const OverallState = z.object({
  prompt: InputState,
  graphOutput: OutputState,
  title: z.string(),
  description: z.string(),
  itinerary: z.array(
    z.object({
      day: z.number(),
      activities: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          activityType: z.enum([
            "eat",
            "shop",
            "visit",
            "exercise",
            "relax",
            "explore",
            "learn",
          ]),
          location: z.string().describe("Location of the activity"),
          placeId: z
            .string()
            .describe("Google Place ID of the activity location"),
        })
      ),
    })
  ),
  tripTags: z.array(z.string()),
  tripPlaces: z.array(
    z.object({
      id: z.string().describe("Google Place ID of the place"),
      name: z.string().describe("Name of the place"),
      address: z.string().describe("Address of the place"),
    })
  ),
});

async function generateTripMetadata(state: z.infer<typeof OverallState>) {
  const msg = await llm
    .withStructuredOutput(
      z.object({
        tripTitle: z
          .string()
          .describe("A catchy and concise title for the trip"),
        tripDescription: z.string().describe("A brief description of the trip"),
        tripTags: z.array(z.string()).describe("Tags related to the trip"),
        numberOfDays: z
          .number()
          .min(1)
          .max(14)
          .describe("Number of days for the trip"),
      })
    )
    .invoke(
      `Based on the following trip idea: "${state.prompt}", generate a catchy and concise title, description, number of days, and tags for the trip.`
    );

  return {
    title: msg.tripTitle,
    description: msg.tripDescription,
    tripTags: msg.tripTags,
  };
}

async function searchGooglePlaces(state: z.infer<typeof OverallState>) {
  const searchQueries = state.tripTags.map(
    (tag) => `${tag} in popular tourist destinations`
  );

  const placesResults = [];

  for (const query of searchQueries) {
    const result = await placesTool.invoke({ input: query });
    placesResults.push(result);
  }

  return {
    tripPlaces: placesResults,
  };
}

async function generateTripItinerary(state: z.infer<typeof OverallState>) {
  const msg = await llm
    .withStructuredOutput(
      z.object({
        itinerary: z.array(
          z.object({
            day: z.number().describe("Day number of the trip"),
            activities: z.array(
              z.object({
                activity: z.string().describe("Description of the activity"),
                location: z.string().describe("Location of the activity"),
                activityType: z
                  .enum([
                    "eat",
                    "shop",
                    "visit",
                    "exercise",
                    "relax",
                    "explore",
                    "learn",
                  ])
                  .describe("Type of the activity"),
                time: z.string().describe("Time of the activity"),
                duration: z.string().describe("Duration of the activity"),
                notes: z.string().describe("Additional notes for the activity"),
                tripPlaceId: z
                  .string()
                  .describe(
                    "Google Place ID associated with the activity, if applicable"
                  ),
              })
            ),
          })
        ),
      })
    )
    .invoke(
      `Based on the following trip idea: "${
        state.prompt
      }" and the following places: ${JSON.stringify(
        state.tripPlaces
      )}, generate a detailed itinerary for ${5} days.`
    );

  const itinerary = msg.itinerary.map((day) => ({
    day: day.day,
    activities: day.activities.map((activity, index) => ({
      id: index + 1,
      name: activity.activity,
      location: activity.location,
      time: activity.time,
      duration: activity.duration,
      notes: activity.notes,
      activityType: activity.activityType,
      placeId: activity.tripPlaceId || "N/A",
    })),
  }));

  return {
    itinerary,
  };
}

export const workflow = new StateGraph({
  state: OverallState,
  input: InputState,
  output: OutputState,
})
  .addNode("generateTripMetadata", generateTripMetadata)
  .addNode("searchGooglePlaces", searchGooglePlaces)
  .addNode("generateTripItinerary", generateTripItinerary)
  .addEdge(START, "generateTripMetadata")
  .addEdge("generateTripMetadata", "searchGooglePlaces")
  .addEdge("searchGooglePlaces", "generateTripItinerary")
  .addEdge("generateTripItinerary", END)
  .compile();
