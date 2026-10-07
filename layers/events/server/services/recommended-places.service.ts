import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { RecommendedPlaceRecord } from "../database/schema";
import type { PlaceCategory } from "../../shared/constants/place-options.constant";

const METERS_PER_DEGREE = 111_320;

export function toStepPlace(place: RecommendedPlaceRecord): StepPlace {
  const mapsUrl = place.googlePlaceId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.googlePlaceId}`
    : `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;

  return {
    source: "recommended",
    id: place.id,
    name: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    mapsUrl,
    rating: null,
    ratingCount: null,
    priceLevel: place.priceLevel,
    description: place.description,
    instagram: place.instagram,
    partner: place.partnerStatus === "partner",
  };
}

// Our own active places of a category around a point, partners first and
// then the closest. A bounding box keeps it on the location index.
export async function findRecommendedNear(
  category: PlaceCategory,
  center: { latitude: number; longitude: number },
  radius: number,
  limit = 4
): Promise<RecommendedPlaceRecord[]> {
  const latDelta = radius / METERS_PER_DEGREE;
  const lngDelta =
    radius /
    (METERS_PER_DEGREE * Math.max(Math.cos((center.latitude * Math.PI) / 180), 0.01));

  const t = tables.recommendedPlaces;
  return useDb()
    .select()
    .from(t)
    .where(
      and(
        eq(t.active, true),
        eq(t.category, category),
        gte(t.latitude, center.latitude - latDelta),
        lte(t.latitude, center.latitude + latDelta),
        gte(t.longitude, center.longitude - lngDelta),
        lte(t.longitude, center.longitude + lngDelta)
      )
    )
    .orderBy(
      sql`(${t.partnerStatus} = 'partner') desc`,
      sql`power(${t.latitude} - ${center.latitude}, 2) + power(${t.longitude} - ${center.longitude}, 2)`
    )
    .limit(limit);
}
