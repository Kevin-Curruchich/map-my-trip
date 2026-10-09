// A trip can cover several towns, so the area around its destination is wide.
const TRIP_RADIUS = 40000;

type Center = { latitude: number; longitude: number };

// Where the trip's places are searched: around the destination when it is
// found in Guatemala, otherwise anywhere in the country.
export async function locateDestination(destination?: string): Promise<Center | null> {
  if (!destination) return null;
  return geocodeLabel(destination).catch((error) => {
    console.error(`Geocoding "${destination}" failed:`, error);
    return null;
  });
}

export async function searchPlaces(query: string, center: Center | null): Promise<TripPlace[]> {
  const places = await searchPlacesInGuatemala(
    query,
    center ? { center, radius: TRIP_RADIUS } : undefined
  );
  return places.map((place) => ({
    id: place.placeId,
    name: place.name,
    address: place.address,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    distance: center && place.location ? distanceInMeters(center, place.location) : null,
  }));
}
