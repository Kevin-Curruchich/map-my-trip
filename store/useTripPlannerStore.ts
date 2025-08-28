import type { Trip } from "~/server/utils/schemas/trip-schema";
import type { IdeaSchema } from "~/server/utils/schemas/idea-schema";

export const useTripPlannerStore = defineStore("tripPlanner", () => {
  const currentTripPlan = ref<Trip | null>(null);
  const isGenerating = ref(false);

  const examplePrompts = ref<IdeaSchema>([]);
  const isGeneratingIdeas = ref(false);

  const setTripPlan = (tripData: any) => {
    currentTripPlan.value = tripData;
  };

  const clearTripPlan = () => {
    currentTripPlan.value = null;
  };

  const generateTripPlan = async (message: string) => {
    isGenerating.value = true;

    try {
      const response = await $fetch("/api/trip-planner", {
        method: "POST",
        body: { message },
      });

      if (!response.success) {
        throw new Error("Failed to generate trip plan");
      }

      const tripData: Trip = response.data.structured_data;

      // Validate that we have the correct structure
      if (!tripData.trip || !tripData.days || !Array.isArray(tripData.days)) {
        throw new Error("Invalid trip data structure received");
      }

      setTripPlan(response.data.structured_data);
      return response.data.structured_data;
    } catch (error) {
      console.error("Error generating trip plan:", error);
      throw error;
    } finally {
      isGenerating.value = false;
    }
  };

  const generatePromptIdeas = async (language: string) => {
    try {
      isGeneratingIdeas.value = true;
      const response = await $fetch("/api/ideas", {
        method: "POST",
        body: { language },
      });

      if (response && response.data.structured_data.length > 0) {
        examplePrompts.value = response.data.structured_data;
      } else {
        console.warn("No prompt ideas returned from server");
      }
    } catch (error) {
      console.error("Error generating prompt ideas:", error);
    } finally {
      isGeneratingIdeas.value = false;
    }
  };

  return {
    currentTripPlan: readonly(currentTripPlan),
    isGenerating: readonly(isGenerating),
    setTripPlan,
    clearTripPlan,
    generateTripPlan,
    generatePromptIdeas,
    examplePrompts,
    isGeneratingIdeas: readonly(isGeneratingIdeas),
  };
});
