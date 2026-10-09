import { z } from "zod";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { useChatModel } from "./llm.service";
import { locateDestination, searchPlaces } from "./places.service";
import {
  checkItinerary,
  clock,
  legBetween,
  legsToRoute,
  parseDuration,
  parseTime,
  repairSchedule,
  type Legs,
} from "./itinerary-checks.service";
import { travelLeg, type Leg } from "./routes.service";

// How many times an itinerary that fails the checks goes back to the AI.
const MAX_CORRECTIONS = 2;
// Shorter trips between places don't get a step of their own.
const MIN_TRAVEL_STEP = 10;

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
  // Set by the evals to compare with fewer corrections.
  maxCorrections: z.number().optional(),
  // Routed travel between places, kept across corrections (see Legs).
  legs: z
    .record(
      z.string(),
      z.object({
        minutes: z.number(),
        meters: z.number(),
        mode: z.enum(["drive", "boat", "estimate"]),
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
  Leave enough time between activities to travel from one place to the next.
  Fix a problem by changing times or picking another place, never by dropping
  a place code: every activity that had one keeps one.`
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

// Share of activities with a place.
function placeShare(itinerary: NonNullable<State["itinerary"]>) {
  const activities = itinerary.flatMap((day) => day.activities);
  return activities.length ? activities.filter((a) => a.placeId).length / activities.length : 0;
}

// Routes the AI's latest itinerary and makes room to travel in it, then keeps
// it when it is the first one, or has fewer problems than the best so far
// without losing places: an activity without a place escapes the checks, so
// dropping places would look like a fix.
async function reviewItinerary(state: State) {
  const places = new Map((state.places ?? []).map((place) => [place.id, place]));
  const legs: Legs = new Map(Object.entries(state.legs ?? {}));
  const missing = legsToRoute(state.proposed ?? [], places, legs);
  await Promise.all(
    [...missing].map(async ([key, { from, to }]) => {
      legs.set(key, await travelLeg(from, to));
    })
  );
  const routed = { legs: Object.fromEntries(legs) };

  const proposed = repairSchedule(state.proposed ?? [], places, legs);
  const problems = checkItinerary(proposed, places, legs);
  if (!state.itinerary) {
    return { ...routed, itinerary: proposed, problems, initialProblems: problems.length };
  }
  if (
    problems.length < (state.problems?.length ?? 0) &&
    placeShare(proposed) >= placeShare(state.itinerary)
  ) {
    return { ...routed, itinerary: proposed, problems };
  }
  return routed;
}

// "25 min", "1 h 20 min".
function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function travelNotes(leg: Leg) {
  if (leg.mode === "drive") return `${formatDistance(leg.meters)} por carretera, según Google Maps.`;
  if (leg.mode === "boat") {
    return "Tiempo estimado en lancha: por carretera el camino es mucho más largo.";
  }
  return `Unos ${formatDistance(leg.meters)} en línea recta; tiempo estimado.`;
}

// Each trip between places as a step of its own, so the itinerary shows the
// road (or the boat) instead of leaving a gap between activities.
function addTravelSteps(state: State) {
  const places = new Map((state.places ?? []).map((place) => [place.id, place]));
  const legs: Legs = new Map(Object.entries(state.legs ?? {}));
  const itinerary = (state.itinerary ?? []).map(({ day, activities }) => ({
    day,
    activities: activities
      .flatMap((activity, index) => {
        const previous = activities[index - 1];
        if (!previous || activity.activityType === "travel" || previous.activityType === "travel") {
          return [activity];
        }
        const leg = legBetween(previous.placeId, activity.placeId, places, legs);
        const start = parseTime(previous.time);
        const length = parseDuration(previous.duration);
        if (!leg || leg.minutes < MIN_TRAVEL_STEP || start === null || length === null) {
          return [activity];
        }
        const place = places.get(activity.placeId!)!;
        const travel = {
          name: `${leg.mode === "boat" ? "Lancha" : "Traslado"} a ${place.name}`,
          location: place.name,
          activityType: "travel" as const,
          time: clock(start + length),
          duration: formatMinutes(leg.minutes),
          notes: travelNotes(leg),
          id: 0,
        };
        return [travel, activity];
      })
      .map((activity, index) => ({ ...activity, id: index + 1 })),
  }));
  return { itinerary };
}

function afterReview(state: State) {
  return state.problems?.length &&
    (state.corrections ?? 0) < (state.maxCorrections ?? MAX_CORRECTIONS)
    ? "generateItinerary"
    : "addTravelSteps";
}

// metadata and tags run in parallel; places need both the tags and the
// destination. An itinerary that fails the checks goes back to the AI; the
// one kept gets a step for each trip between places.
export const tripGraph = new StateGraph(TripState)
  .addNode("generateMetadata", generateMetadata)
  .addNode("generateTags", generateTags)
  .addNode("findPlaces", findPlaces)
  .addNode("generateItinerary", generateItinerary)
  .addNode("checkItinerary", reviewItinerary)
  .addNode("addTravelSteps", addTravelSteps)
  .addEdge(START, "generateMetadata")
  .addEdge(START, "generateTags")
  .addEdge(["generateMetadata", "generateTags"], "findPlaces")
  .addEdge("findPlaces", "generateItinerary")
  .addEdge("generateItinerary", "checkItinerary")
  .addConditionalEdges("checkItinerary", afterReview, ["generateItinerary", "addTravelSteps"])
  .addEdge("addTravelSteps", END)
  .compile();
