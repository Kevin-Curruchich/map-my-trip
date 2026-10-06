import { importLibrary } from "@googlemaps/js-api-loader";

async function resolveActivityLocations(
  itinerary: ItineraryDay[]
): Promise<ActivityWithPlace[]> {
  const { Place } = await importLibrary("places");
  const activities = itinerary.flatMap((day) => day.activities);

  const resolved = await Promise.all(
    activities.map(async (activity) => {
      if (!activity.placeId) return null;

      try {
        const place = new Place({ id: activity.placeId });
        await place.fetchFields({ fields: ["location"] });

        if (!place.location) return null;

        return {
          ...activity,
          latitude: place.location.lat(),
          longitude: place.location.lng(),
        };
      } catch (error) {
        console.error(`Could not resolve place ${activity.placeId}:`, error);
        return null;
      }
    })
  );

  return resolved.filter((activity) => activity !== null);
}

export default function useTrips() {
  const trips = useState<Trip[]>("trips", () => []);

  async function createTrip(prompt: string) {
    const generated = await $fetch("/api/trips", {
      method: "POST",
      body: { prompt },
    });

    const trip: Trip = {
      ...generated,
      id: crypto.randomUUID(),
      activitiesWithPlaces: await resolveActivityLocations(
        generated.itinerary
      ),
    };

    trips.value.push(trip);

    return trip;
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
