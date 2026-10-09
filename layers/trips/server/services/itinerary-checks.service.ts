// What code can tell is wrong with an itinerary: activities that overlap or go
// out of order, too little time to travel between places, a place repeated on
// another day.

// Roads are about this much longer than a straight line, and this fast on
// average: a rough lower bound for the time between two places.
const ROAD_FACTOR = 1.3;
const ROAD_SPEED_KMH = 40;
// Moves shorter than this are on foot and fit in any gap.
const WALKING_DISTANCE = 1500;

export interface ItineraryActivity {
  name: string;
  activityType: string;
  time: string;
  duration: string;
  placeId?: string;
}

export interface ItineraryProblem {
  kind: "overlap" | "order" | "travel" | "repeated";
  day: number;
  // In English, like the trip prompts: it goes back to the AI as is.
  message: string;
}

type PlacePoint = { name: string; latitude: number | null; longitude: number | null };

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

function clock(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export function checkItinerary(
  days: { day: number; activities: ItineraryActivity[] }[],
  places: Map<string, PlacePoint>
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

      const before = previous.placeId ? places.get(previous.placeId) : undefined;
      if (
        before?.latitude == null ||
        before.longitude == null ||
        place?.latitude == null ||
        place.longitude == null
      ) {
        return;
      }
      const distance = distanceInMeters(
        { latitude: before.latitude, longitude: before.longitude },
        { latitude: place.latitude, longitude: place.longitude }
      );
      if (distance < WALKING_DISTANCE) return;
      const travel = Math.round(((distance / 1000) * ROAD_FACTOR * 60) / ROAD_SPEED_KMH);
      // A travel activity is the trip itself: its duration has to cover it.
      if (activity.activityType === "travel") {
        const length = parseDuration(activity.duration);
        if (length !== null && start - previousEnd + length < travel) {
          problems.push({
            kind: "travel",
            day,
            message: `Day ${day}: "${activity.name}" takes ${activity.duration}, but ${before.name} and ${place.name} are ${formatDistance(distance)} apart (about ${travel} min by road).`,
          });
        }
        return;
      }
      if (start - previousEnd < travel) {
        problems.push({
          kind: "travel",
          day,
          message: `Day ${day}: ${before.name} and ${place.name} are ${formatDistance(distance)} apart (about ${travel} min by road), but "${activity.name}" starts ${start - previousEnd} min after "${previous.name}" ends.`,
        });
      }
    });
  }

  return problems;
}
