// Thin client for the Places API (New), shared by the place search and the
// proposal generator. The key never leaves the server.
// https://developers.google.com/maps/documentation/places/web-service/op-overview

const PLACES_API = "https://places.googleapis.com/v1";

function placesFetch<T>(path: string, fieldMask: string, init: { method?: "GET" | "POST"; body?: object; query?: Record<string, string> } = {}) {
  return $fetch<T>(`${PLACES_API}${path}`, {
    method: init.method ?? "GET",
    query: init.query,
    body: init.body,
    headers: {
      "X-Goog-Api-Key": useRuntimeConfig().googlePlacesApiKey,
      "X-Goog-FieldMask": fieldMask,
    },
  });
}

function circle(latitude: number, longitude: number, radius: number) {
  return { circle: { center: { latitude, longitude }, radius } };
}

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

// Suggestions while typing. Requests that share a session token with the
// details call that follows are billed as a single session.
// https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
export async function autocompletePlaces(
  input: string,
  sessionToken: string,
  near?: { latitude: number; longitude: number }
): Promise<PlaceSuggestion[]> {
  const response = await placesFetch<{
    suggestions?: {
      placePrediction?: {
        placeId: string;
        text?: { text: string };
        structuredFormat?: {
          mainText?: { text: string };
          secondaryText?: { text: string };
        };
      };
    }[];
  }>("/places:autocomplete", "*", {
    method: "POST",
    body: {
      input,
      sessionToken,
      languageCode: "es",
      ...(near
        ? { locationBias: circle(near.latitude, near.longitude, 50000) }
        : {}),
    },
  });

  return (response.suggestions ?? []).flatMap(({ placePrediction: p }) =>
    p
      ? [
          {
            placeId: p.placeId,
            name: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
            address: p.structuredFormat?.secondaryText?.text ?? "",
          },
        ]
      : []
  );
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Ends the autocomplete session: only Essentials fields are requested.
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  const place = await placesFetch<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location: { latitude: number; longitude: number };
  }>(
    `/places/${encodeURIComponent(placeId)}`,
    "id,displayName,formattedAddress,location",
    {
      query: {
        languageCode: "es",
        ...(sessionToken ? { sessionToken } : {}),
      },
    }
  );

  return {
    placeId: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
    latitude: place.location.latitude,
    longitude: place.location.longitude,
  };
}

const PRICE_LEVELS: Record<string, StepPlace["priceLevel"]> = {
  PRICE_LEVEL_FREE: "low",
  PRICE_LEVEL_INEXPENSIVE: "low",
  PRICE_LEVEL_MODERATE: "medium",
  PRICE_LEVEL_EXPENSIVE: "high",
  PRICE_LEVEL_VERY_EXPENSIVE: "high",
};

// Real places for one step of a plan, e.g. "café de especialidad", ranked by
// Google around the event.
// https://developers.google.com/maps/documentation/places/web-service/text-search
export async function searchPlacesNear(
  query: string,
  center: { latitude: number; longitude: number },
  radius: number
): Promise<StepPlace[]> {
  const response = await placesFetch<{
    places?: {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      rating?: number;
      userRatingCount?: number;
      priceLevel?: string;
      googleMapsUri?: string;
      businessStatus?: string;
    }[];
  }>(
    "/places:searchText",
    "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.googleMapsUri,places.businessStatus",
    {
      method: "POST",
      body: {
        textQuery: query,
        languageCode: "es",
        pageSize: 6,
        locationBias: circle(center.latitude, center.longitude, radius),
      },
    }
  );

  return (response.places ?? [])
    .filter((place) => place.businessStatus !== "CLOSED_PERMANENTLY")
    .map((place) => ({
      source: "google" as const,
      id: place.id,
      name: place.displayName?.text ?? "",
      address: place.formattedAddress ?? null,
      latitude: place.location?.latitude ?? null,
      longitude: place.location?.longitude ?? null,
      mapsUrl:
        place.googleMapsUri ??
        `https://www.google.com/maps/place/?q=place_id:${place.id}`,
      rating: place.rating ?? null,
      ratingCount: place.userRatingCount ?? null,
      priceLevel: place.priceLevel ? (PRICE_LEVELS[place.priceLevel] ?? null) : null,
      description: null,
      instagram: null,
      partner: false,
    }));
}

// Coordinates for an event that only has a typed place name.
export async function geocodeLabel(label: string) {
  const response = await placesFetch<{
    places?: { location?: { latitude: number; longitude: number } }[];
  }>("/places:searchText", "places.location", {
    method: "POST",
    body: { textQuery: label, languageCode: "es", pageSize: 1 },
  });
  return response.places?.[0]?.location ?? null;
}
