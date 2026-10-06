interface PlacesTextSearchResponse {
  places?: {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
  }[];
}

// Google Places API (New) text search.
// https://developers.google.com/maps/documentation/places/web-service/text-search
export async function searchPlaces(query: string): Promise<TripPlace[]> {
  const response = await $fetch<PlacesTextSearchResponse>(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": useRuntimeConfig().googlePlacesApiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress",
      },
      body: { textQuery: query },
    }
  );

  return (response.places ?? []).map((place) => ({
    id: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
  }));
}
