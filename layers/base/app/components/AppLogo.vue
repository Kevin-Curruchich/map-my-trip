<script setup lang="ts">
// The mark is a chat bubble whose tail pins a place; the green dot is the
// option the group picked. Variants keep it readable on any background.
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
  color: { bubble: "#FFA51F", side: "#1C1917", middle: "#12A150" },
  dark: { bubble: "#1C1917", side: "#FFA51F", middle: "#12A150" },
  light: { bubble: "#FFFFFF", side: "#1C1917", middle: "#12A150" },
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
      <circle cx="19" cy="27" r="4.5" :fill="fill.side" />
      <circle cx="32" cy="27" r="4.5" :fill="fill.middle" />
      <circle cx="45" cy="27" r="4.5" :fill="fill.side" />
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
