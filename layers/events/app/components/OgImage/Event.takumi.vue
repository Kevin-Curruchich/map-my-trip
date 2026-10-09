<script setup lang="ts">
// Rendered to an image by nuxt-og-image for the link preview in WhatsApp and
// other apps. Only the slug travels in the image URL; the data is read here so
// nobody can craft a preview with arbitrary text on our domain.
const { slug } = defineProps<{ slug: string }>();

const event = await $fetch(`/api/events/${slug}`).catch(() => null);

// Cuts on a word boundary so the preview never ends mid-word.
function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

const statusLabel = {
  open: "Únete y di qué quieres hacer",
  voting: "Votación abierta",
  closed: "Plan decidido",
} as const;

const whereWhen = event
  ? [event.city, event.date && formatEventDate(event.date)]
      .filter(Boolean)
      .join(" · ")
  : "";
const winner = event?.proposals.find((p) => p.id === event.winningProposalId);
const title = truncate(event?.title ?? "", 52);
// Long titles get a smaller size so they still fit in two lines.
const titleSize = title.length > 32 ? "text-[64px]" : "text-[84px]";
const footer = event
  ? truncate(winner ? `Ganó: ${winner.title}` : statusLabel[event.status], 34)
  : "";
const people = event?.participants.length ?? 0;
const peopleLabel =
  people === 0
    ? "Sé el primero en unirte"
    : people === 1
      ? "1 persona se unió"
      : `${people} personas se unieron`;
</script>

<template>
  <div
    class="og-root w-full h-full flex flex-col justify-between p-16"
    style="background-color: #FFA51F; color: #1C1917"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <path
            d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z"
            fill="#1C1917"
          />
          <circle cx="17" cy="24" r="4.5" fill="#FFA51F" />
          <path d="M25 23h14a7 7 0 0 1-14 0z" fill="#FFA51F" />
          <circle cx="47" cy="24" r="4.5" fill="#FFA51F" />
        </svg>
        <span class="ml-4 text-4xl font-extrabold" style="letter-spacing: -0.03em">
          MapMyTrip
        </span>
      </div>
      <span
        class="px-6 py-2 rounded-full text-2xl font-bold"
        style="background-color: #1C1917; color: #FFFFFF"
      >
        Plan en grupo
      </span>
    </div>

    <div v-if="event" class="flex flex-col">
      <h1
        class="leading-tight font-extrabold"
        :class="titleSize"
        style="line-clamp: 2; letter-spacing: -0.03em"
      >
        {{ title }}
      </h1>
      <p class="mt-6 text-4xl font-bold" style="line-clamp: 1; color: #2B1A00; opacity: 0.8">
        {{ truncate(whereWhen, 60) }}
      </p>
    </div>
    <h1
      v-else
      class="text-[84px] leading-none font-extrabold"
      style="letter-spacing: -0.03em"
    >
      Decidan juntos qué hacer
    </h1>

    <div
      v-if="event"
      class="flex items-center justify-between rounded-3xl bg-white px-10 py-6"
    >
      <span class="text-3xl font-extrabold" style="line-clamp: 1">
        {{ footer }}
      </span>
      <span class="ml-6 shrink-0 whitespace-nowrap text-3xl font-medium" style="color: #57534E">
        {{ peopleLabel }}
      </span>
    </div>
  </div>
</template>

<style>
/* nuxt-og-image reads the font family from the SFC style block. */
.og-root {
  font-family: "Manrope", sans-serif;
}
</style>
