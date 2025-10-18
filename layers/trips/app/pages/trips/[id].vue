<script setup lang="ts">
import { getActivityIcon } from "~~/layers/trips/server/utils/getActivitIcon";

const route = useRoute();
const tripId = route.params.id as string;

// Use the new composable
const { trip } = useTrip(tripId);

// Set page meta
useSeoMeta({
  title: computed(() =>
    trip.value
      ? `${trip.value.title} - Map My Trip`
      : "Trip Details - Map My Trip"
  ),
  description: computed(
    () => trip.value?.description || "View your trip itinerary and activities"
  ),
});

// Transform activities into timeline format
const timelineItems = (activities: Activity[]) => {
  return activities.map((activity) => ({
    title: activity.name,
    icon: getActivityIcon(activity.activityType),
  }));
};

// Action handlers
const shareTrip = () => {
  if (navigator.share && trip.value) {
    navigator
      .share({
        title: trip.value.title,
        text: trip.value.description,
        url: window.location.href,
      })
      .catch(() => {
        // Fallback: copy to clipboard
        copyToClipboard();
      });
  } else {
    copyToClipboard();
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    // You could add a toast notification here
    console.log("Trip link copied to clipboard!");
  });
};

const duplicateTrip = () => {
  if (trip.value) {
    const { createTripAndNavigate } = useTrips();
    // Create a new trip with similar content
    const prompt = `Create a trip similar to: ${trip.value.title}. ${trip.value.description}`;
    createTripAndNavigate(prompt);
  }
};
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading state -->
    <div v-if="!trip" class="max-w-4xl mx-auto">
      <UCard>
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-6" />
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded" />
            <div class="h-4 bg-gray-200 rounded w-5/6" />
            <div class="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Trip details -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          to="/trips"
          variant="ghost"
          color="neutral"
          size="sm"
          class="mb-4"
        >
          <UIcon name="i-lucide-arrow-left" />
          Back to Trips
        </UButton>

        <UCard>
          <template #header>
            <div class="flex items-start justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ trip.title }}
                </h1>
                <p class="text-gray-600">
                  {{ trip.description }}
                </p>
              </div>
              <UBadge color="primary" variant="soft">
                {{ trip.itinerary.length }}
                {{ trip.itinerary.length === 1 ? "Day" : "Days" }}
              </UBadge>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Itinerary Timeline -->
      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-lucide-calendar" class="h-5 w-5 text-primary mr-2" />
            <h2 class="text-lg font-semibold">Itinerary</h2>
          </div>
        </template>

        <div class="space-y-8">
          <div v-for="day in trip.itinerary" :key="day.day" class="relative">
            <!-- Day header -->
            <div class="flex items-center mb-4">
              <div
                class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full font-semibold text-sm mr-3"
              >
                {{ day.day }}
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                Day {{ day.day }}
              </h3>
            </div>

            <!-- Activities Timeline -->
            <div class="ml-7 pl-4 border-l-2 border-gray-200 last:border-l-0">
              <UTimeline
                :items="timelineItems(day.activities)"
                size="sm"
                color="primary"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Trip Actions -->
      <div class="mt-8 flex justify-center space-x-4">
        <UButton color="primary" variant="solid" @click="shareTrip">
          <UIcon name="i-lucide-share-2" />
          Share Trip
        </UButton>

        <UButton color="neutral" variant="outline" @click="duplicateTrip">
          <UIcon name="i-lucide-copy" />
          Duplicate Trip
        </UButton>
      </div>
    </div>
  </div>
</template>
