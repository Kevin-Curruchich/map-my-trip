<script setup lang="ts">
import type { TimelineItem } from "@nuxt/ui";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const toast = useToast();
const { trip, notFound } = useTrip(() => String(route.params.id));
const { createTripAndNavigate } = useTrips();

useSeoMeta({
  title: () =>
    trip.value ? `${trip.value.title} - Map My Trip` : "Trip Details - Map My Trip",
  description: () =>
    trip.value?.description ?? "View your trip itinerary and activities",
});

function toTimelineItems(activities: Activity[]): TimelineItem[] {
  return activities.map((activity) => ({
    date: activity.time,
    title: activity.name,
    description: activity.notes,
    icon: getActivityIcon(activity.activityType),
  }));
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href);
  toast.add({ title: "Link copied to clipboard", icon: "i-lucide-check" });
}

async function shareTrip() {
  if (!trip.value) return;

  if (!navigator.share) {
    await copyLink();
    return;
  }

  try {
    await navigator.share({
      title: trip.value.title,
      text: trip.value.description,
      url: window.location.href,
    });
  } catch (error) {
    // The user closing the share sheet is not an error.
    if ((error as DOMException).name !== "AbortError") await copyLink();
  }
}

const isDuplicating = ref(false);

async function duplicateTrip() {
  if (!trip.value) return;

  isDuplicating.value = true;
  try {
    await createTripAndNavigate(
      `Create a trip similar to: ${trip.value.title}. ${trip.value.description}`
    );
  } finally {
    isDuplicating.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <UEmpty
      v-if="!trip && notFound"
      icon="i-lucide-map"
      title="Trip not found"
      description="It may have been deleted or belong to another account."
      :actions="[{ label: 'Plan a trip', to: '/trips' }, { label: 'Mis planes', to: '/plans', variant: 'outline' }]"
    />

    <div v-else-if="!trip" class="flex justify-center py-24">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
    </div>

    <template v-else>
      <UButton
        to="/trips"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        class="mb-4"
      >
        Back to Trips
      </UButton>

      <UCard class="mb-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="mb-2 text-2xl font-bold text-highlighted">
              {{ trip.title }}
            </h1>
            <p class="text-muted">{{ trip.description }}</p>
          </div>
          <UBadge color="primary" variant="soft">
            {{ trip.itinerary.length }}
            {{ trip.itinerary.length === 1 ? "Day" : "Days" }}
          </UBadge>
        </div>
      </UCard>

      <ItineraryPlaces :activities="trip.activitiesWithPlaces" class="mb-8" />

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="size-5 text-primary" />
            <h2 class="text-lg font-semibold">Itinerary</h2>
          </div>
        </template>

        <div class="space-y-8">
          <section v-for="day in trip.itinerary" :key="day.day">
            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-inverted"
              >
                {{ day.day }}
              </div>
              <h3 class="text-lg font-semibold text-highlighted">
                Day {{ day.day }}
              </h3>
            </div>

            <UTimeline
              :items="toTimelineItems(day.activities)"
              size="sm"
              color="primary"
              class="ml-4"
            />
          </section>
        </div>
      </UCard>

      <div class="mt-8 flex justify-center gap-4">
        <UButton icon="i-lucide-share-2" @click="shareTrip">Share Trip</UButton>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-copy"
          :loading="isDuplicating"
          @click="duplicateTrip"
        >
          Duplicate Trip
        </UButton>
      </div>
    </template>
  </div>
</template>
