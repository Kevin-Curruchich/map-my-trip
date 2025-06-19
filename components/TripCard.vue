<script setup lang="ts">
import type { Trip } from "~/types/domain";

interface Props {
  trip: Trip;
}

const props = defineProps<Props>();

const formatCurrency = (amount: number | null) => {
  if (!amount) return "Budget not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Date not set";
  return new Date(dateString).toLocaleDateString();
};

const getDurationText = (days: number | null) => {
  if (!days) return "Duration not set";
  return days === 1 ? "1 day" : `${days} days`;
};

const menuItems = [
  [
    {
      label: "Edit Trip",
      icon: "i-heroicons-pencil-square",
      click: () => {
        // Handle edit action
        console.log("Edit trip:", props.trip.id);
      },
    },
  ],
  [
    {
      label: "Duplicate",
      icon: "i-heroicons-document-duplicate",
      click: () => {
        // Handle duplicate action
        console.log("Duplicate trip:", props.trip.id);
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click: () => {
        // Handle delete action
        console.log("Delete trip:", props.trip.id);
      },
    },
  ],
];
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow duration-200">
    <!-- Cover Image -->
    <template #header>
      <div class="relative h-48 overflow-hidden">
        <img
          v-if="trip.cover_image_url"
          :src="trip.cover_image_url"
          :alt="trip.title"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gray-100 flex items-center justify-center"
        >
          <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
        </div>

        <!-- Badges overlay -->
        <div class="absolute top-3 right-3 flex gap-2">
          <UBadge
            v-if="trip.is_public"
            color="emerald"
            variant="solid"
            size="xs"
          >
            Public
          </UBadge>
          <UBadge
            v-if="trip.is_template"
            color="blue"
            variant="solid"
            size="xs"
          >
            Template
          </UBadge>
        </div>
      </div>
    </template>

    <!-- Content -->
    <div class="space-y-4">
      <!-- Title -->
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {{ trip.title }}
        </h3>
      </div>

      <!-- Description -->
      <p v-if="trip.description" class="text-sm text-gray-600 line-clamp-3">
        {{ trip.description }}
      </p>

      <!-- Meta information -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
          <span>{{ getDurationText(trip.duration_days) }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
          <span>{{ formatCurrency(trip.estimated_budget) }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-clock" class="w-4 h-4" />
          <span>Created {{ formatDate(trip.created_at) }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div
        v-if="trip.tags && trip.tags.length > 0"
        class="flex flex-wrap gap-1"
      >
        <UBadge
          v-for="tag in trip.tags"
          :key="tag"
          color="gray"
          variant="soft"
          size="xs"
        >
          #{{ tag }}
        </UBadge>
      </div>
    </div>

    <!-- Actions -->
    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <UButton
          :to="`/dashboard/trips/${trip.id}`"
          color="primary"
          variant="solid"
          size="sm"
          class="flex-1"
        >
          View Trip
        </UButton>

        <UDropdown :items="menuItems" :popper="{ placement: 'bottom-end' }">
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            square
            icon="i-heroicons-ellipsis-horizontal"
          />
        </UDropdown>
      </div>
    </template>
  </UCard>
</template>
