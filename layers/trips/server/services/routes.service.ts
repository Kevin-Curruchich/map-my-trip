// Travel between two places of an itinerary: by road from the Routes API, by
// boat when the road goes the long way around (a lake), or an estimate when
// there is no route. The key is the same as the Places API's.
// https://developers.google.com/maps/documentation/routes/compute_route_directions

const ROUTES_API = "https://routes.googleapis.com/directions/v2:computeRoutes";

// Roads this many times longer than the straight line go around water: across
// Lake Atitlán the road takes 2 hours and a boat 25 minutes.
const DETOUR = 3;
const BOAT_SPEED_KMH = 25;
const BOAT_WAIT = 15;
// Without a route: roads are about this much longer and this fast on average.
const ROAD_FACTOR = 1.3;
const ROAD_SPEED_KMH = 40;

type Point = { latitude: number; longitude: number };

export interface Leg {
  minutes: number;
  // Road meters for "drive", straight-line meters otherwise.
  meters: number;
  mode: "drive" | "boat" | "estimate";
}

async function drive(from: Point, to: Point) {
  const response = await $fetch<{ routes?: { duration?: string; distanceMeters?: number }[] }>(
    ROUTES_API,
    {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": useRuntimeConfig().googlePlacesApiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
      },
      body: {
        // Only the coordinates: any other field is a 400.
        origin: { location: { latLng: { latitude: from.latitude, longitude: from.longitude } } },
        destination: { location: { latLng: { latitude: to.latitude, longitude: to.longitude } } },
        travelMode: "DRIVE",
        // Without traffic: the cheaper SKU, and trips have no date anyway.
        routingPreference: "TRAFFIC_UNAWARE",
        regionCode: "gt",
      },
    }
  );
  const route = response.routes?.[0];
  if (!route?.duration || route.distanceMeters === undefined) return null;
  return { seconds: Number.parseInt(route.duration, 10), meters: route.distanceMeters };
}

export function estimateLeg(from: Point, to: Point): Leg {
  const meters = distanceInMeters(from, to);
  return {
    minutes: Math.round(((meters / 1000) * ROAD_FACTOR * 60) / ROAD_SPEED_KMH),
    meters,
    mode: "estimate",
  };
}

export async function travelLeg(from: Point, to: Point): Promise<Leg> {
  const straight = distanceInMeters(from, to);
  const route = await drive(from, to).catch((error) => {
    console.error("Routes API failed:", error);
    return null;
  });
  if (!route) return estimateLeg(from, to);
  if (route.meters > DETOUR * straight) {
    return {
      minutes: Math.round(((straight / 1000) * 60) / BOAT_SPEED_KMH) + BOAT_WAIT,
      meters: straight,
      mode: "boat",
    };
  }
  return { minutes: Math.round(route.seconds / 60), meters: route.meters, mode: "drive" };
}
