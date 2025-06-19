import type { Database } from "~/database.types";
import type { Trip } from "~/types/domain";

// composables/useTrips.ts
export const useTrips = () => {
  const client = useSupabaseClient<Database>();
  const user = useAuth();

  const userId = computed(() => user.data.value?.user.id || "");

  // Get user trips with automatic caching
  const getUserTrips = () => {
    return useQuery({
      key: ["trips", "user", userId.value],
      query: async () => {
        const { data, error } = await client
          .from("trips")
          .select("*")
          .eq("creator_id", userId.value)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      },
    });
  };

  // Create trip with optimistic updates
  const createTrip = () => {
    return useMutation({
      key: ["trips", "create"],
      mutation: async (
        trip: Omit<Trip, "id" | "created_at" | "updated_at">
      ) => {
        const { data, error } = await client
          .from("trips")
          .insert(trip)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
    });
  };

  return {
    getUserTrips,
    createTrip,
  };
};
