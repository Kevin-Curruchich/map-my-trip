import { estimateLeg, type Leg } from "./routes.service";

// Itineraries in code: times moved so there is room to travel between places,
// and what is still wrong after that (a place repeated on another day, a day
// that ends too late) for the AI to fix.

// Moves shorter than this are on foot and fit in any gap.
const WALKING_DISTANCE = 1500;
// Moved activities start on a quarter hour, and a day should end by this time.
const TIME_STEP = 15;
const LATEST_END = 22 * 60 + 30;

export interface ItineraryActivity {
  name: string;
  activityType: string;
  time: string;
  duration: string;
  placeId?: string;
}

export interface ItineraryProblem {
  kind: "overlap" | "order" | "travel" | "repeated" | "late";
  day: number;
  // In English, like the trip prompts: it goes back to the AI as is.
  message: string;
}

type PlacePoint = { name: string; latitude: number | null; longitude: number | null };
type Day<A> = { day: number; activities: A[] };

// Travel times between places, from the Routes API, by "<from id>><to id>".
export type Legs = Map<string, Leg>;
export const legKey = (from: string, to: string) => `${from}>${to}`;

// "9:00 AM", "2:30 pm" or "14:00" -> minutes after midnight; else null.
export function parseTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?$/i.exec(value.trim());
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.[0]?.toLowerCase();
  if (meridiem === "p" && hour < 12) hour += 12;
  if (meridiem === "a" && hour === 12) hour = 0;
  return hour < 24 && minute < 60 ? hour * 60 + minute : null;
}

// "2 hours", "45 minutes", "1.5 hours", "1 hour 30 minutes" -> minutes; else null.
export function parseDuration(value: string) {
  const hours = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i.exec(value);
  const minutes = /(\d+)\s*(?:minutes?|mins?|m)\b/i.exec(value);
  if (!hours && !minutes) return null;
  return Math.round(Number(hours?.[1] ?? 0) * 60 + Number(minutes?.[1] ?? 0));
}

export function clock(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

function located(placeId: string | undefined, places: Map<string, PlacePoint>) {
  const place = placeId ? places.get(placeId) : undefined;
  return place?.latitude != null && place.longitude != null
    ? { ...place, latitude: place.latitude, longitude: place.longitude }
    : null;
}

// The way from one place to the next: the routed leg when there is one, an
// estimate otherwise, or null on foot or when either place is unknown.
export function legBetween(
  fromId: string | undefined,
  toId: string | undefined,
  places: Map<string, PlacePoint>,
  legs: Legs
): Leg | null {
  const from = located(fromId, places);
  const to = located(toId, places);
  if (!from || !to || distanceInMeters(from, to) < WALKING_DISTANCE) return null;
  return legs.get(legKey(fromId!, toId!)) ?? estimateLeg(from, to);
}

// Consecutive places of the itinerary that need a route and have none yet,
// except into a travel activity the AI wrote itself (a boat, a shuttle).
export function legsToRoute(
  days: Day<ItineraryActivity>[],
  places: Map<string, PlacePoint>,
  legs: Legs
) {
  const missing = new Map<string, { from: PlacePoint & { latitude: number; longitude: number }; to: PlacePoint & { latitude: number; longitude: number } }>();
  for (const { activities } of days) {
    activities.forEach((activity, index) => {
      const previous = activities[index - 1];
      if (!previous?.placeId || !activity.placeId || activity.activityType === "travel") return;
      const key = legKey(previous.placeId, activity.placeId);
      const from = located(previous.placeId, places);
      const to = located(activity.placeId, places);
      if (legs.has(key) || !from || !to || distanceInMeters(from, to) < WALKING_DISTANCE) return;
      missing.set(key, { from, to });
    });
  }
  return missing;
}

function describeLeg(leg: Leg) {
  return leg.mode === "boat" ? `about ${leg.minutes} min by boat` : `about ${leg.minutes} min by road`;
}

// Moves activities later so each one starts after the one before has ended,
// with time to get there. The AI tends to leave no room for the road, and
// asking it again rarely fixes that; the order and durations stay as it wrote.
export function repairSchedule<A extends ItineraryActivity>(
  days: Day<A>[],
  places: Map<string, PlacePoint>,
  legs: Legs
) {
  return days.map(({ day, activities }) => {
    let previousEnd: number | null = null;
    let previousPlaceId: string | undefined;
    return {
      day,
      activities: activities.map((activity) => {
        let start = parseTime(activity.time);
        const length = parseDuration(activity.duration);
        let moved = activity;
        if (start !== null && previousEnd !== null) {
          // A travel activity is the road itself: it starts when the last ends.
          const travel =
            activity.activityType === "travel"
              ? 0
              : (legBetween(previousPlaceId, activity.placeId, places, legs)?.minutes ?? 0);
          const earliest = previousEnd + travel;
          if (start < earliest) {
            start = Math.ceil(earliest / TIME_STEP) * TIME_STEP;
            moved = { ...activity, time: clock(start) };
          }
        }
        // Past an activity without a usable time or duration nothing is known.
        previousEnd = start !== null && length !== null ? start + length : null;
        previousPlaceId = activity.placeId;
        return moved;
      }),
    };
  });
}

export function checkItinerary(
  days: Day<ItineraryActivity>[],
  places: Map<string, PlacePoint>,
  legs: Legs
): ItineraryProblem[] {
  const problems: ItineraryProblem[] = [];
  const seen = new Map<string, number>();

  for (const { day, activities } of days) {
    activities.forEach((activity, index) => {
      const place = activity.placeId ? places.get(activity.placeId) : undefined;
      // Going back to a place, or a town used twice in a day, is fine.
      if (place && activity.placeId && activity.activityType !== "travel") {
        const firstDay = seen.get(activity.placeId);
        if (firstDay !== undefined && firstDay !== day) {
          problems.push({
            kind: "repeated",
            day,
            message: `Day ${day}: "${activity.name}" uses ${place.name} again (already on day ${firstDay}); pick another place.`,
          });
        } else if (firstDay === undefined) {
          seen.set(activity.placeId, day);
        }
      }

      const previous = activities[index - 1];
      if (!previous) return;
      const start = parseTime(activity.time);
      const previousStart = parseTime(previous.time);
      const previousLength = parseDuration(previous.duration);
      if (start === null || previousStart === null) return;

      if (start <= previousStart) {
        problems.push({
          kind: "order",
          day,
          message: `Day ${day}: "${activity.name}" starts at ${activity.time}, not after "${previous.name}" (${previous.time}).`,
        });
        return;
      }
      if (previousLength === null) return;

      const previousEnd = previousStart + previousLength;
      if (previousEnd > start) {
        problems.push({
          kind: "overlap",
          day,
          message: `Day ${day}: "${previous.name}" (${previous.time}, ${previous.duration}) runs until ${clock(previousEnd)}, past the start of "${activity.name}" at ${activity.time}.`,
        });
        return;
      }

      const leg = legBetween(previous.placeId, activity.placeId, places, legs);
      if (!leg) return;
      const before = places.get(previous.placeId!)!;
      const way = `${before.name} and ${place!.name} are ${formatDistance(leg.meters)} apart (${describeLeg(leg)})`;
      // A travel activity is the trip itself: its duration has to cover it.
      if (activity.activityType === "travel") {
        const length = parseDuration(activity.duration);
        if (length !== null && start - previousEnd + length < leg.minutes) {
          problems.push({
            kind: "travel",
            day,
            message: `Day ${day}: "${activity.name}" takes ${activity.duration}, but ${way}.`,
          });
        }
        return;
      }
      if (start - previousEnd < leg.minutes) {
        problems.push({
          kind: "travel",
          day,
          message: `Day ${day}: ${way}, but "${activity.name}" starts ${start - previousEnd} min after "${previous.name}" ends.`,
        });
      }
    });

    const last = activities.at(-1);
    const lastStart = last ? parseTime(last.time) : null;
    const lastLength = last ? parseDuration(last.duration) : null;
    if (last && lastStart !== null && lastLength !== null && lastStart + lastLength > LATEST_END) {
      problems.push({
        kind: "late",
        day,
        message: `Day ${day} ends at ${clock(lastStart + lastLength)} once there is time to travel between places; drop or shorten an activity so it ends by ${clock(LATEST_END)}.`,
      });
    }
  }

  return problems;
}
