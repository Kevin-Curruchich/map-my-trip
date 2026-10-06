import { z } from "zod";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { useChatModel } from "./llm.service";
import { searchPlaces } from "./places.service";

const ActivitySchema = z.object({
  name: z.string().describe("Short description of the activity"),
  location: z.string().describe("Location of the activity"),
  activityType: z.enum(ACTIVITY_TYPES).describe("Type of the activity"),
  time: z.string().describe('Start time, e.g. "9:00 AM"'),
  duration: z.string().describe('Duration, e.g. "2 hours"'),
  notes: z.string().describe("Tips or what to expect"),
  placeId: z
    .string()
    .optional()
    .describe("Google Place ID from the available places, if applicable"),
});

const TripState = new StateSchema({
  prompt: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  destination: z.string().optional(),
  tags: z.array(z.string()).optional(),
  places: z.array(
    z.object({ id: z.string(), name: z.string(), address: z.string() })
  ).optional(),
  itinerary: z
    .array(
      z.object({
        day: z.number(),
        activities: z.array(ActivitySchema.extend({ id: z.number() })),
      })
    )
    .optional(),
});

type State = typeof TripState.State;

async function generateMetadata(state: State) {
  const metadata = await useChatModel()
    .withStructuredOutput(
      z.object({
        title: z.string().describe("A catchy and concise title for the trip"),
        description: z.string().describe("A brief description of the trip"),
        destination: z.string().describe("The main destination of the trip"),
      })
    )
    .invoke(
      `Based on the following trip idea: "${state.prompt}", generate a catchy title, a brief description and identify the main destination.`
    );

  return metadata;
}

async function generateTags(state: State) {
  const { tags } = await useChatModel()
    .withStructuredOutput(
      z.object({
        tags: z
          .array(z.string())
          .min(5)
          .max(8)
          .describe("Search terms related to the trip"),
      })
    )
    .invoke(
      `Based on the following trip idea: "${state.prompt}", generate a list of search terms.
      They will be used to search for places with the Google Places API, so focus on activities, food and themes that help find interesting places.`
    );

  return { tags };
}

async function findPlaces(state: State) {
  const results = await Promise.all(
    (state.tags ?? []).map((tag) =>
      searchPlaces(`${tag} in ${state.destination}`)
    )
  );

  const places = [
    ...new Map(results.flat().map((place) => [place.id, place])).values(),
  ];

  return { places };
}

async function generateItinerary(state: State) {
  const { itinerary } = await useChatModel()
    .withStructuredOutput(
      z.object({
        itinerary: z.array(
          z.object({
            day: z.number().describe("Day number of the trip"),
            activities: z.array(ActivitySchema),
          })
        ),
      })
    )
    .invoke(
      `Create a detailed itinerary for "${state.prompt}" in ${state.destination}.
  Cover the number of days requested in the trip idea (1 day if none is specified).

  Available places to include:
  ${JSON.stringify(state.places)}

  Requirements:
  - Balance different activity types (eating, sightseeing, relaxation, etc.)
  - Consider logical timing and travel distances between locations
  - Use the provided place IDs when referencing specific venues
  - Include realistic time slots (e.g., "9:00 AM", "2:30 PM")
  - Suggest appropriate durations (e.g., "2 hours", "45 minutes")
  - Provide helpful notes for each activity (tips, what to expect, etc.)
  - Start each day around 8-9 AM and end by 8-9 PM
  - Group nearby activities together to minimize travel time`
    );

  return {
    itinerary: itinerary.map((day) => ({
      day: day.day,
      activities: day.activities.map((activity, index) => ({
        ...activity,
        id: index + 1,
      })),
    })),
  };
}

// metadata and tags run in parallel; places need both the tags and the destination.
export const tripGraph = new StateGraph(TripState)
  .addNode("generateMetadata", generateMetadata)
  .addNode("generateTags", generateTags)
  .addNode("findPlaces", findPlaces)
  .addNode("generateItinerary", generateItinerary)
  .addEdge(START, "generateMetadata")
  .addEdge(START, "generateTags")
  .addEdge(["generateMetadata", "generateTags"], "findPlaces")
  .addEdge("findPlaces", "generateItinerary")
  .addEdge("generateItinerary", END)
  .compile();
