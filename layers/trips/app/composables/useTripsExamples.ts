export default function useTripsExamples() {
  const tripsExamples = useState<TripExample[]>("tripsExamples", () => []);

  const { data, execute, status } = useFetch<TripExample[]>(
    "/api/trips/examples",
    {
      default: () => [],
      immediate: false,
    }
  );

  async function fetchTripsExamples() {
    if (status.value !== "idle") return;
    await execute();

    tripsExamples.value = data.value || [];
  }

  return {
    tripsExamples,
    fetchTripsExamples,
  };
}
