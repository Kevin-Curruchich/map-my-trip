export default function useTrip(tripId: string) {
  const { trips } = useTrips();

  const trip = computed(() => {
    return trips.value.find((t) => t.id === tripId);
  });

  return {
    trip,
  };
}
