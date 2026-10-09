import { z } from "zod";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { useChatModel } from "./llm.service";
import { locateDestination, searchPlaces } from "./places.service";
import { checkItinerary } from "./itinerary-checks.service";

// How many times an itinerary that fails the checks goes back to the AI.
const MAX_CORRECTIONS = 2;

const ActivitySchema = z.object({
  name: z.string().describe("Short description of the activity"),
  location: z.string().describe("Location of the activity"),
  activityType: z.enum(ACTIVITY_TYPES).describe("Type of the activity"),
  time: z.string().describe('Start time, e.g. "9:00 AM"'),
  duration: z.string().describe('Duration, e.g. "2 hours"'),
  notes: z.string().describe("Tips or what to expect"),
  // Nullable, not optional: OpenAI's strict structured output requires every
  // property to be listed as required.
  place: z
    .string()
    .nullable()
    .describe('Code of the place from the available places, e.g. "L3", or null'),
});

const ItinerarySchema = z.array(
  z.object({
    day: z.number(),
    activities: z.array(
      ActivitySchema.omit({ place: true }).extend({
        id: z.number(),
        placeId: z.string().optional(),
      })
    ),
  })
);

const TripState = new StateSchema({
  prompt: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  destination: z.string().optional(),
  tags: z.array(z.string()).optional(),
  places: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      address: z.string(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      distance: z.number().nullable(),
    })
  ).optional(),
  // The AI's latest itinerary, and the best one so far by the checks.
  proposed: ItinerarySchema.optional(),
  itinerary: ItinerarySchema.optional(),
  // What the checks found in the best itinerary, and in the first one.
  problems: z
    .array(z.object({ kind: z.string(), day: z.number(), message: z.string() }))
    .optional(),
  initialProblems: z.number().optional(),
  corrections: z.number().optional(),
});

type State = typeof TripState.State;

async function generateMetadata(state: State) {
  const metadata = await useChatModel()
    .withStructuredOutput(
      z.object({
        title: z.string().describe("A catchy and concise title for the trip"),
        description: z.string().describe("A brief description of the trip"),
        destination: z
          .string()
          .describe("The main destination of the trip, a place in Guatemala"),
      })
    )
    .invoke(
      `Based on the following trip idea: "${state.prompt}", generate a catchy title, a brief description and identify the main destination.
      For now every trip is in Guatemala: when the idea names no place, pick a fitting destination there.`
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
  const center = await locateDestination(state.destination);
  const results = await Promise.all(
    (state.tags ?? []).map((tag) =>
      searchPlaces(`${tag} in ${state.destination}`, center).catch((error) => {
        console.error(`Places search failed for "${tag}":`, error);
        return [];
      })
    )
  );

  const places = [
    ...new Map(results.flat().map((place) => [place.id, place])).values(),
  ];

  return { places };
}

// One line per place, with a short code the model can't misspell, its
// distance from the destination and its coordinates to group nearby places.
function describePlaces(places: TripPlace[]) {
  return places
    .map((place, index) => {
      const details = [
        place.address,
        place.distance !== null ? `${formatDistance(place.distance)} from the destination` : null,
        place.latitude !== null && place.longitude !== null
          ? `(${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)})`
          : null,
      ].filter(Boolean);
      return `L${index + 1}: ${place.name} — ${details.join(" · ")}`;
    })
    .join("\n");
}

// The itinerary as the AI wrote it, with place codes instead of ids.
function describeItinerary(itinerary: NonNullable<State["itinerary"]>, places: TripPlace[]) {
  const codes = new Map(places.map((place, index) => [place.id, `L${index + 1}`]));
  return itinerary
    .map(
      (day) =>
        `  Day ${day.day}\n${day.activities
          .map(
            (activity) =>
              `    ${activity.time} (${activity.duration}) ${activity.name}${activity.placeId ? ` [${codes.get(activity.placeId)}]` : ""}`
          )
          .join("\n")}`
    )
    .join("\n");
}

async function generateItinerary(state: State) {
  const places = state.places ?? [];
  const codes = new Map(places.map((place, index) => [`L${index + 1}`, place.id]));
  // A second pass gets back the best itinerary so far and what failed in it.
  const correcting = Boolean(state.itinerary && state.problems?.length);
  const correction = correcting
    ? `

  Your previous itinerary failed some checks:
${describeItinerary(state.itinerary!, places)}

  Problems to fix:
${state.problems!.map((problem) => `  - ${problem.message}`).join("\n")}

  Write the whole itinerary again with every problem fixed. Keep what works.
  Leave enough time between activities to travel from one place to the next.`
    : "";

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

  Available places to include, with their distance from the destination and
  their coordinates:
${describePlaces(places)}

  Requirements:
  - Balance different activity types (eating, sightseeing, relaxation, etc.)
  - Consider logical timing and travel distances between locations
  - Use the place codes (e.g. "L3") when referencing specific venues
  - Include realistic time slots (e.g., "9:00 AM", "2:30 PM")
  - Suggest appropriate durations (e.g., "2 hours", "45 minutes")
  - Provide helpful notes for each activity (tips, what to expect, etc.)
  - Start each day around 8-9 AM and end by 8-9 PM
  - Group places with close coordinates on the same day to minimize travel time
  - Leave time to travel between places that are not within walking distance;
    a longer trip (a boat, a shuttle) can be its own "travel" activity${correction}`,
      { runName: correcting ? "correct-itinerary" : "generate-itinerary" }
    );

  return {
    corrections: (state.corrections ?? 0) + (correcting ? 1 : 0),
    proposed: itinerary.map((day) => ({
      day: day.day,
      activities: day.activities.map(({ place, ...activity }, index) => {
        // Only codes from the list count; anything else means no place.
        const placeId = place ? codes.get(place) : undefined;
        return { ...activity, ...(placeId ? { placeId } : {}), id: index + 1 };
      }),
    })),
  };
}

// Keeps the AI's latest itinerary when it is the first one or has fewer
// problems than the best so far.
function reviewItinerary(state: State) {
  const places = new Map((state.places ?? []).map((place) => [place.id, place]));
  const problems = checkItinerary(state.proposed ?? [], places);
  if (!state.itinerary) {
    return { itinerary: state.proposed, problems, initialProblems: problems.length };
  }
  if (problems.length < (state.problems?.length ?? 0)) {
    return { itinerary: state.proposed, problems };
  }
  return {};
}

function afterReview(state: State) {
  return state.problems?.length && (state.corrections ?? 0) < MAX_CORRECTIONS
    ? "generateItinerary"
    : END;
}

// metadata and tags run in parallel; places need both the tags and the
// destination. An itinerary that fails the checks goes back to the AI.
export const tripGraph = new StateGraph(TripState)
  .addNode("generateMetadata", generateMetadata)
  .addNode("generateTags", generateTags)
  .addNode("findPlaces", findPlaces)
  .addNode("generateItinerary", generateItinerary)
  .addNode("checkItinerary", reviewItinerary)
  .addEdge(START, "generateMetadata")
  .addEdge(START, "generateTags")
  .addEdge(["generateMetadata", "generateTags"], "findPlaces")
  .addEdge("findPlaces", "generateItinerary")
  .addEdge("generateItinerary", "checkItinerary")
  .addConditionalEdges("checkItinerary", afterReview, ["generateItinerary", END])
  .compile();
