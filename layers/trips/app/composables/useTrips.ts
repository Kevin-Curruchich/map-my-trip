export default function useTrips() {
  const trips = useState<Trip[]>("trips", () => []);

  async function createTrip(prompt: string) {
    const { response } = await $fetch("/api/trips", {
      method: "POST",
      body: { prompt: prompt },
    });

    const tripWithId = { id: crypto.randomUUID(), ...response };
    trips.value.push(tripWithId);

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
