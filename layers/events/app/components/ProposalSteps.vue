<script setup lang="ts">
import { eventBudgetOptions } from "~~/layers/events/shared/constants/event-options.constant";

defineProps<{
  steps: StoredProposalStep[];
  selected?: PlaceRef | null;
}>();
defineEmits<{ select: [place: PlaceRef] }>();

function priceLabel(level: StepPlace["priceLevel"]) {
  return eventBudgetOptions.find((option) => option.value === level)?.label;
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

        <PlaceCard
          v-if="step.place"
          :name="step.place.name"
          :selected="selected?.source === step.place.source && selected?.id === step.place.id"
          :description="step.place.description"
          :rating="step.place.rating"
          :rating-count="step.place.ratingCount"
          :price-label="priceLabel(step.place.priceLevel)"
          :address="step.place.address"
          @select="$emit('select', { source: step.place.source, id: step.place.id })"
        >
          <template #badges>
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
          </template>
          <template #meta>
            <ULink
              v-if="step.place.instagram"
              :to="instagramUrl(step.place.instagram)"
              target="_blank"
              class="inline-flex items-center gap-1"
            >
              <UIcon name="i-simple-icons-instagram" />
              Instagram
            </ULink>
          </template>
        </PlaceCard>
      </div>
    </li>
  </ol>
</template>
