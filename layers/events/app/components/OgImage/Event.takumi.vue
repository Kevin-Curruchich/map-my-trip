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
    class="w-full h-full flex flex-col justify-between p-16"
    style="background-image: linear-gradient(135deg, #10b981 0%, #a3e635 100%)"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <div
          class="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-3xl font-black"
        >
          M
        </div>
        <span class="ml-4 text-3xl font-bold text-black">MapMyTrip</span>
      </div>
      <span
        class="px-6 py-2 rounded-full bg-black/85 text-white text-2xl font-semibold"
      >
        Plan en grupo
      </span>
    </div>

    <div v-if="event" class="flex flex-col">
      <h1
        class="leading-tight font-black text-black"
        :class="titleSize"
        style="line-clamp: 2"
      >
        {{ title }}
      </h1>
      <p class="mt-6 text-4xl font-semibold text-black/80" style="line-clamp: 1">
        {{ truncate(whereWhen, 60) }}
      </p>
    </div>
    <h1 v-else class="text-[84px] leading-none font-black text-black">
      Decidan juntos qué hacer
    </h1>

    <div
      v-if="event"
      class="flex items-center justify-between rounded-3xl bg-white px-10 py-6"
    >
      <span class="text-3xl font-bold text-black" style="line-clamp: 1">
        {{ footer }}
      </span>
      <span class="ml-6 shrink-0 whitespace-nowrap text-3xl text-black/60">
        {{ peopleLabel }}
      </span>
    </div>
  </div>
</template>
