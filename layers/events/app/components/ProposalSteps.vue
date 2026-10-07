<script setup lang="ts">
import { eventBudgetOptions } from "~~/layers/events/shared/constants/event-options.constant";

defineProps<{
  steps: StoredProposalStep[];
}>();

function priceLabel(level: StepPlace["priceLevel"]) {
  return eventBudgetOptions.find((option) => option.value === level)?.label;
}

function instagramUrl(handle: string) {
  return handle.startsWith("http")
    ? handle
    : `https://instagram.com/${handle.replace(/^@/, "")}`;
}
</script>

<template>
  <ol class="space-y-3">
    <li
      v-for="(step, index) in steps"
      :key="index"
      class="flex gap-3"
    >
      <span
        class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold"
      >
        {{ index + 1 }}
      </span>

      <!-- Proposals made before places existed are plain text. -->
      <p v-if="typeof step === 'string'" class="text-sm">{{ step }}</p>

      <div v-else class="min-w-0 flex-1 space-y-1">
        <p class="text-sm font-medium">{{ step.title }}</p>

        <div v-if="step.place" class="rounded-lg border border-default p-3 text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <ULink
              :to="step.place.mapsUrl"
              target="_blank"
              class="inline-flex items-center gap-1 font-semibold text-highlighted"
            >
              <UIcon name="i-lucide-map-pin" class="shrink-0 text-primary" />
              {{ step.place.name }}
            </ULink>
            <UBadge
              v-if="step.place.partner"
              color="primary"
              variant="subtle"
              size="sm"
              icon="i-lucide-handshake"
            >
              Aliado MapMyTrip
            </UBadge>
            <UBadge
              v-else-if="step.place.source === 'recommended'"
              color="success"
              variant="subtle"
              size="sm"
              icon="i-lucide-sparkles"
            >
              Recomendado
            </UBadge>
          </div>

          <p v-if="step.place.description" class="mt-1">
            {{ step.place.description }}
          </p>

          <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
            <span v-if="step.place.rating" class="inline-flex items-center gap-1">
              <UIcon name="i-lucide-star" class="text-warning" />
              {{ step.place.rating.toFixed(1) }}
              <span v-if="step.place.ratingCount">({{ step.place.ratingCount }})</span>
            </span>
            <span v-if="priceLabel(step.place.priceLevel)">
              {{ priceLabel(step.place.priceLevel) }}
            </span>
            <span v-if="step.place.address" class="truncate">
              {{ step.place.address }}
            </span>
            <ULink
              v-if="step.place.instagram"
              :to="instagramUrl(step.place.instagram)"
              target="_blank"
              class="inline-flex items-center gap-1"
            >
              <UIcon name="i-simple-icons-instagram" />
              Instagram
            </ULink>
          </div>
        </div>
      </div>
    </li>
  </ol>
</template>
