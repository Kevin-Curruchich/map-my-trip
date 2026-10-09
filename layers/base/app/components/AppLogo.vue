<script setup lang="ts">
// The mark is a chat bubble whose tail pins a place; the "typing" dots end in
// a smile in the middle. Variants keep it readable on any background.
const {
  variant = "color",
  size = 32,
  wordmark = true,
} = defineProps<{
  variant?: "color" | "dark" | "light";
  size?: number;
  wordmark?: boolean;
}>();

const fills = {
  color: { bubble: "#FFA51F", face: "#1C1917" },
  dark: { bubble: "#1C1917", face: "#FFA51F" },
  light: { bubble: "#FFFFFF", face: "#1C1917" },
} as const;
const fill = computed(() => fills[variant]);
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      :aria-hidden="wordmark ? 'true' : undefined"
      :role="wordmark ? undefined : 'img'"
      :aria-label="wordmark ? undefined : 'MapMyTrip'"
      class="shrink-0"
    >
      <path
        d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z"
        :fill="fill.bubble"
      />
      <circle cx="17" cy="24" r="4.5" :fill="fill.face" />
      <path d="M25 23h14a7 7 0 0 1-14 0z" :fill="fill.face" />
      <circle cx="47" cy="24" r="4.5" :fill="fill.face" />
    </svg>
    <span
      v-if="wordmark"
      class="text-xl font-extrabold tracking-tight"
      :class="variant === 'light' ? 'text-white' : 'text-highlighted'"
    >
      MapMy<span class="text-mango-600">Trip</span>
    </span>
  </span>
</template>
