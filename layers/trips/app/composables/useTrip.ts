export default function useTrip(tripId: MaybeRefOrGetter<string>) {
  const { trips } = useTrips();

  const trip = computed(() =>
    trips.value.find((t) => t.id === toValue(tripId))
  );

  return {
    trip,
  };
}
