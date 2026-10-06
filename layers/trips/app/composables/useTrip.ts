import { resolveActivityLocations } from "./useTrips";

// A trip from this session's state, or loaded from the API after a reload
// or when opened from "Mis planes".
export default function useTrip(tripId: MaybeRefOrGetter<string>) {
  const { trips } = useTrips();
  const isLoading = ref(false);
  const notFound = ref(false);

  const trip = computed(() =>
    trips.value.find((t) => t.id === toValue(tripId))
  );

  async function load() {
    const id = toValue(tripId);
    if (!id || trips.value.some((t) => t.id === id)) return;

    isLoading.value = true;
    notFound.value = false;
    try {
      // Typed by hand: the route also matches /api/trips/examples.
      const saved = await $fetch<Omit<Trip, "activitiesWithPlaces">>(
        `/api/trips/${id}`
      );
      trips.value.push({
        ...saved,
        activitiesWithPlaces: await resolveActivityLocations(saved.itinerary),
      });
    } catch (error) {
      console.error(`Could not load trip ${id}:`, error);
      notFound.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  // Places resolve through the Maps JS API, so this only runs in the browser.
  onMounted(load);
  watch(() => toValue(tripId), load);

  return {
    trip,
    isLoading,
    notFound,
  };
}
