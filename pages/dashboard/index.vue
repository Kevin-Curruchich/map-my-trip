<script setup lang="ts">
import GoogleMap from "~/components/Map/GoogleMap.vue";

definePageMeta({
  layout: "authenticated",
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-end">
          <div class="flex items-center gap-2">
            <UButton to="/dashboard/trips/new" color="primary">
              Create New Trip
            </UButton>
            <UButton
              to="/dashboard/trips"
              color="secondary"
              class="hidden md:inline-flex"
            >
              View All Trips
            </UButton>
          </div>
        </div>
      </template>

      <!-- <div class="space-y-3">
        <UCard
          v-for="trip in trips"
          :key="trip.id"
          class="cursor-pointer hover:bg-gray-50 transition-colors"
          @click="$router.push(`/dashboard/trips/${trip.id}`)"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">{{ trip.name }}</h3>
              <p class="text-sm text-gray-500">{{ trip.destination }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">{{ trip.date }}</p>
              <UBadge :color="trip.status === 'completed' ? 'primary' : 'secondary'">
                {{ trip.status }}
              </UBadge>
            </div>
          </div>
        </UCard>
        
        <div v-if="!trips.length" class="text-center py-8 text-gray-500">
          No trips found. Create your first trip!
        </div>
      </div> -->
    </UCard>
  </div>

  <!-- <GoogleMap /> -->
</template>
