<script setup lang="ts">
// A place in an itinerary or a proposal: its name opens the place panel.
defineProps<{
  name: string;
  selected?: boolean;
  description?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  priceLabel?: string | null;
  address?: string | null;
}>();
defineEmits<{ select: [] }>();
</script>

<template>
  <div class="rounded-lg border border-default p-3 text-sm">
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 text-left font-semibold text-highlighted underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:decoration-primary"
        :class="{ 'text-primary': selected }"
        @click="$emit('select')"
      >
        <UIcon name="i-lucide-map-pin" class="shrink-0 text-primary" />
        {{ name }}
      </button>
      <slot name="badges" />
    </div>

    <p v-if="description" class="mt-1">{{ description }}</p>

    <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
      <span v-if="rating" class="inline-flex items-center gap-1">
        <UIcon name="i-lucide-star" class="text-warning" />
        {{ rating.toFixed(1) }}
        <span v-if="ratingCount">({{ ratingCount }})</span>
      </span>
      <span v-if="priceLabel">{{ priceLabel }}</span>
      <span v-if="address" class="truncate">{{ address }}</span>
      <slot name="meta" />
    </div>
  </div>
</template>
