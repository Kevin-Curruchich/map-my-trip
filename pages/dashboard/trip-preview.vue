<script setup lang="ts">
import type { Trip, Day, Activity } from "~/server/utils/schemas/trip-schema";
import { useTripPlannerStore } from "~/store/useTripPlannerStore";

definePageMeta({
  layout: "authenticated",
});

const { t } = useI18n();
const tripStore = useTripPlannerStore();

// Reactive trip data for editing
const editableTripData = ref<Trip | null>(null);
const isEditing = ref(false);
const isSaving = ref(false);

// Initialize editable data
watch(
  () => tripStore.currentTripPlan,
  (newPlan) => {
    if (newPlan) {
      editableTripData.value = JSON.parse(JSON.stringify(newPlan)); // Deep clone
    }
  },
  { immediate: true }
);

// Redirect if no trip data
if (!tripStore.currentTripPlan) {
  await navigateTo("/dashboard");
}

// Save trip to database
const saveTripPlan = async () => {
  if (!editableTripData.value) return;

  isSaving.value = true;

  try {
  } catch (error) {
    console.error("Error saving trip:", error);
  } finally {
    isSaving.value = false;
  }
};

// Edit functions
const updateTripTitle = (newTitle: string) => {
  if (editableTripData.value) {
    editableTripData.value.trip.title = newTitle;
  }
};

const updateTripDescription = (newDescription: string) => {
  if (editableTripData.value) {
    editableTripData.value.trip.description = newDescription;
  }
};

const updateActivityDetails = (
  dayIndex: number,
  activityIndex: number,
  updates: Partial<Activity>
) => {
  if (editableTripData.value) {
    Object.assign(
      editableTripData.value.days[dayIndex].activities[activityIndex],
      updates
    );
  }
};

const removeActivity = (dayIndex: number, activityIndex: number) => {
  if (editableTripData.value) {
    editableTripData.value.days[dayIndex].activities.splice(activityIndex, 1);
  }
};

const addActivity = (dayIndex: number) => {
  if (editableTripData.value) {
    const newActivity: Activity = {
      title: "New Activity",
      description: "",
      location: "",
      google_place_name: "",
      activity_type: "sightseeing",
      start_time: "10:00",
      end_time: "11:00",
      estimated_duration: 60,
      estimated_cost: 0,
      order_index: editableTripData.value.days[dayIndex].activities.length,
      notes: "",
    };

    editableTripData.value.days[dayIndex].activities.push(newActivity);
  }
};

// Generate new plan
const generateNewPlan = async () => {
  tripStore.clearTripPlan();
  await navigateTo("/dashboard");
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Trip Preview</h1>
          <p class="text-gray-600">
            Review and customize your AI-generated trip plan
          </p>
        </div>

        <div class="flex gap-3">
          <UButton
            @click="generateNewPlan"
            variant="outline"
            icon="i-heroicons-arrow-left"
          >
            Generate New
          </UButton>

          <UButton
            @click="saveTripPlan"
            :loading="isSaving"
            icon="i-heroicons-bookmark"
          >
            Save Trip
          </UButton>
        </div>
      </div>

      <!-- Trip Overview -->
      <div v-if="editableTripData" class="space-y-6">
        <!-- Trip Metadata Card -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Trip Overview</h2>
          </template>

          <div class="space-y-4">
            <!-- Editable Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Trip Title
              </label>
              <UInput
                v-model="editableTripData.trip.title"
                @blur="updateTripTitle(editableTripData.trip.title)"
                class="w-full"
              />
            </div>

            <!-- Editable Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <UTextarea
                v-model="editableTripData.trip.description"
                @blur="updateTripDescription(editableTripData.trip.description)"
                :rows="3"
                class="w-full"
              />
            </div>

            <!-- Trip Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">
                  {{ editableTripData.trip.duration_days }}
                </div>
                <div class="text-sm text-gray-600">Days</div>
              </div>

              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">
                  ${{ editableTripData.trip.estimated_budget }}
                </div>
                <div class="text-sm text-gray-600">Budget</div>
              </div>

              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">
                  {{ editableTripData.trip.difficulty_level }}
                </div>
                <div class="text-sm text-gray-600">Difficulty</div>
              </div>

              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">
                  {{
                    editableTripData.days.reduce(
                      (total, day) => total + day.activities.length,
                      0
                    )
                  }}
                </div>
                <div class="text-sm text-gray-600">Activities</div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Daily Itinerary -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Daily Itinerary</h2>

          <div
            v-for="(day, dayIndex) in editableTripData.days"
            :key="day.day_number"
            class="space-y-3"
          >
            <UCard>
              <template #header>
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium">
                    Day {{ day.day_number }}: {{ day.title }}
                  </h3>
                  <UButton
                    @click="addActivity(dayIndex)"
                    size="sm"
                    variant="outline"
                    icon="i-heroicons-plus"
                  >
                    Add Activity
                  </UButton>
                </div>
              </template>

              <!-- Activities -->
              <div class="space-y-3">
                <div
                  v-for="(activity, activityIndex) in day.activities"
                  :key="activityIndex"
                  class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                      <UInput
                        v-model="activity.title"
                        class="font-medium text-lg mb-2"
                        variant="none"
                      />
                      <UTextarea
                        v-model="activity.description"
                        :rows="2"
                        class="w-full"
                        variant="none"
                      />
                    </div>

                    <UButton
                      @click="removeActivity(dayIndex, activityIndex)"
                      size="sm"
                      color="red"
                      variant="ghost"
                      icon="i-heroicons-trash"
                    />
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span class="text-gray-600">Location:</span>
                      <UInput v-model="activity.location" size="sm" />
                    </div>
                    <div>
                      <span class="text-gray-600">Time:</span>
                      <div class="flex gap-1">
                        <UInput v-model="activity.start_time" size="sm" />
                        <UInput v-model="activity.end_time" size="sm" />
                      </div>
                    </div>
                    <div>
                      <span class="text-gray-600">Duration:</span>
                      <UInput
                        v-model.number="activity.estimated_duration"
                        size="sm"
                      />
                    </div>
                    <div>
                      <span class="text-gray-600">Cost:</span>
                      <UInput
                        v-model.number="activity.estimated_cost"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Budget Breakdown -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Budget Breakdown</h2>
          </template>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              v-for="(amount, category) in editableTripData.budget_breakdown"
              :key="category"
            >
              <label
                class="block text-sm font-medium text-gray-700 mb-1 capitalize"
              >
                {{ category }}
              </label>
              <UInput
                v-model.number="editableTripData.budget_breakdown[category]"
                type="number"
                class="w-full"
              />
            </div>
          </div>
        </UCard>

        <!-- Travel Tips -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Travel Tips</h2>
          </template>

          <ul class="space-y-2">
            <li
              v-for="(tip, index) in editableTripData.travel_tips"
              :key="index"
              class="flex items-start gap-2"
            >
              <span class="text-blue-500 mt-1">•</span>
              <UTextarea
                v-model="editableTripData.travel_tips[index]"
                :rows="1"
                autoresize
                class="flex-1"
                variant="none"
              />
            </li>
          </ul>
        </UCard>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600">Loading trip data...</p>
      </div>
    </div>
  </div>
</template>
