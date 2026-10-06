export default function useTripsExamples() {
  const { data: tripsExamples } = useLazyFetch("/api/trips/examples", {
    key: "trip-examples",
    default: () => [],
  });

  return {
    tripsExamples,
  };
}
