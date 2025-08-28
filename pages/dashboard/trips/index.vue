<script setup lang="ts">
definePageMeta({
  layout: "authenticated",
});

const { getUserTrips } = useTrips();

const { data: trips, isLoading } = getUserTrips();
</script>

<template>
  <div class="main-h-screen bg-gray-50 p-6">
    <div
      class="border border-gray-200 bg-white p-4 rounded-lg mb-6 flex items-center justify-between"
    >
      <h1 class="text-xl font-semibold text-gray-900">Your Trips</h1>
      <UButton to="/dashboard" color="primary" icon="i-heroicons-plus">
        Create New Trip
      </UButton>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <USkeleton
          v-for="i in 6"
          :key="i"
          class="h-64 w-full"
          :ui="{ rounded: 'rounded-lg' }"
        />
      </div>
    </template>

    <template v-else-if="trips && trips.length > 0">
      <div
        class="flex-col gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
      </div>
    </template>

    <template v-else>
      <div
        class="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-lg shadow-md"
      >
        <Icon name="heroicons:map" class="mb-4 text-gray-400 w-16 h-16" />
        <h3 class="text-xl font-semibold">No trips yet</h3>
        <p class="text-gray-600 mb-4">
          Start planning your first adventure by creating a new trip.
        </p>
        <NuxtLink to="/dashboard" class="text-blue-500 hover:underline">
          Create Your First Trip
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
