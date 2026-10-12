import { and, eq } from "drizzle-orm";
import { toStepPlace } from "./recommended-places.service";

const NOT_RECOMMENDED = {
  description: null,
  instagram: null,
  whatsapp: null,
  partner: false,
};

// What the place panel shows. A recommended place adds Google's photos,
// hours and reviews when the admin linked it to its Google place.
export async function getPlaceInfo(place: PlaceRef): Promise<PlaceInfo> {
  if (place.source === "google") {
    const google = await getPlaceProfile(place.id).catch((error) => {
      console.error(`Place details failed for ${place.id}:`, error);
      throw createError({ statusCode: 502, statusMessage: "Google Places failed" });
    });
    return { ...place, ...NOT_RECOMMENDED, ...google, fromGoogle: true };
  }

  const t = tables.recommendedPlaces;
  const ours = await useDb().query.recommendedPlaces.findFirst({
    where: and(eq(t.id, place.id), eq(t.active, true)),
  });
  if (!ours) {
    throw createError({ statusCode: 404, statusMessage: "Place not found" });
  }

  // Our own data is still worth showing when Google fails.
  const google = ours.googlePlaceId
    ? await getPlaceProfile(ours.googlePlaceId).catch((error) => {
        console.error(`Place details failed for ${ours.googlePlaceId}:`, error);
        return null;
      })
    : null;

  return {
    ...place,
    name: ours.name,
    address: ours.address ?? google?.address ?? null,
    mapsUrl: google?.mapsUrl ?? toStepPlace(ours).mapsUrl,
    rating: google?.rating ?? null,
    ratingCount: google?.ratingCount ?? null,
    phone: google?.phone ?? null,
    website: ours.website ?? google?.website ?? null,
    description: ours.description,
    instagram: ours.instagram,
    whatsapp: ours.whatsapp,
    partner: ours.partnerStatus === "partner",
    openNow: google?.openNow ?? null,
    weekdayHours: google?.weekdayHours ?? [],
    photos: google?.photos ?? [],
    reviews: google?.reviews ?? [],
    fromGoogle: google !== null,
  };
}
