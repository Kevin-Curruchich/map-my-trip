import { PlaceSearchQuerySchema } from "../../schemas";

interface PlacesTextSearchResponse {
  places?: {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
  }[];
}

// Suggestions for the event's "¿Dónde?" field, biased to the user's
// location when the browser shares it.
// https://developers.google.com/maps/documentation/places/web-service/text-search
export default defineEventHandler(async (event) => {
  const { q, lat, lng } = await getValidatedQuery(
    event,
    PlaceSearchQuerySchema.parse
  );

  const response = await $fetch<PlacesTextSearchResponse>(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": useRuntimeConfig().googlePlacesApiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location",
      },
      body: {
        textQuery: q,
        languageCode: "es",
        pageSize: 5,
        ...(lat !== undefined && lng !== undefined
          ? {
              locationBias: {
                circle: {
                  center: { latitude: lat, longitude: lng },
                  radius: 50000,
                },
              },
            }
          : {}),
      },
    }
  );

  return (response.places ?? []).map((place) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
  }));
});
