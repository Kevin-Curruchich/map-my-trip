<script setup lang="ts">
definePageMeta({
  layout: "authenticated",
});

const { getUserTrips } = useTrips();

const { data: trips, isLoading } = getUserTrips();
</script>

<template>
  <div class="trips-page">
    <div
      class="border border-gray-200 bg-white p-4 rounded-lg mb-6 flex items-center justify-between"
    >
      <h1 class="text-xl font-semibold text-gray-900">Your Trips</h1>
      <UButton to="/dashboard/trips/new" color="primary">
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
      <div class="trips-page__grid">
        <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
      </div>
    </template>

    <template v-else>
      <div class="trips-page__empty">
        <Icon name="heroicons:map" class="trips-page__empty-icon" />
        <h3 class="trips-page__empty-title">No trips yet</h3>
        <p class="trips-page__empty-description">
          Start planning your first adventure by creating a new trip.
        </p>
        <NuxtLink to="/dashboard/trips/create" class="trips-page__empty-cta">
          Create Your First Trip
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
