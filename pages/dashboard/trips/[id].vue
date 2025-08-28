<script setup lang="ts">
import GoogleMap from "~/components/Map/GoogleMap.vue";

definePageMeta({
  layout: "authenticated",
});

const { getTripById } = useTrips();

const route = useRoute();
const tripId = route.params.id as string;
const { data: trip, isLoading } = getTripById(tripId);
</script>

<template>
  <div class="main-h-screen bg-gray-50 p-6">
    <div class="header flex justify-between border-b">
      <UButton
        to="/dashboard/trips"
        color="secondary"
        variant="outline"
        icon="heroicons:arrow-left"
        size="xs"
        class="mb-4"
      >
        Back to Trips
      </UButton>

      <h2 class="text-2xl font-bold mb-4">Trip Details</h2>
    </div>

    <template v-if="isLoading">
      <USkeleton class="h-64 w-full mb-6" :ui="{ rounded: 'rounded-lg' }" />
      <USkeleton class="h-8 w-1/2 mb-4" :ui="{ rounded: 'rounded-lg' }" />
      <USkeleton class="h-6 w-1/3 mb-4" :ui="{ rounded: 'rounded-lg' }" />
      <USkeleton class="h-6 w-1/4 mb-4" :ui="{ rounded: 'rounded-lg' }" />
    </template>

    <template v-else-if="trip">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="">
          <GoogleMap />
        </div>
        <div class="">
          <h3 class="text-xl font-semibold mb-2">{{ trip.title }}</h3>
          <p class="text-gray-700 mb-4">
            {{ trip.description || "No description provided." }}
          </p>
          <ul class="list-disc pl-5 text-gray-700">
            <li>Start Date: January 1, 2024</li>
            <li>End Date: January 10, 2024</li>
            <li>Destination: Paris, France</li>
            <li>Budget: $2000</li>
            <li>Participants: 2</li>
            <li>Activities: Sightseeing, Dining, Shopping</li>
          </ul>
          <div class="mt-4 flex justify-end gap-2">
            <UButton color="error" variant="outline"> Delete Trip </UButton>
            <UButton color="primary"> Edit Trip </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
