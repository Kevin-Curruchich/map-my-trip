import { importLibrary } from "@googlemaps/js-api-loader";

export default function useTrips() {
  const trips = useState<Trip[]>("trips", () => []);

  async function createTrip(prompt: string) {
    const { response } = await $fetch("/api/trips", {
      method: "POST",
      body: { prompt: prompt },
    });
    const { Place } = await importLibrary("places");

    const activitiesWithPlaces = [];

    for (const day of response.itinerary) {
      for (const activity of day.activities) {
        if (activity?.placeId) {
          const place = new Place({
            id: activity.placeId,
          });

          try {
            await place.fetchFields({
              fields: ["location"],
            });
          } catch (e) {
            console.error("Error fetching place data:", e);
            continue; // Skip this activity if there's an error fetching place data
          }

          if (place && place?.location) {
            activitiesWithPlaces.push({
              ...activity,
              latitude: place.location.lat(),
              longitude: place.location.lng(),
            });
          }
        }
      }
    }

    const tripWithId = { id: crypto.randomUUID(), ...response };
    trips.value.push({ ...tripWithId, activitiesWithPlaces });

    return tripWithId;
  }

  async function createTripAndNavigate(prompt: string) {
    const trip = await createTrip(prompt);
    await navigateTo(`/trips/${trip.id}`);
  }

  return {
    trips,
    createTrip,
    createTripAndNavigate,
  };
}
