<script setup lang="ts">
import { eventBudgetOptions } from "~~/layers/events/shared/constants/event-options.constant";

// Sample data shaped like a real plan in voting; labels come from the app so
// the demo can't drift from what people will actually see.
const budget = (value: "low" | "medium" | "high") =>
  eventBudgetOptions.find((option) => option.value === value)?.label;

const proposals = [
  {
    title: "Café, cerro y atardecer",
    budget: budget("medium"),
    votes: 3,
    mine: true,
    steps: [
      { title: "Desayuno con vista al volcán", place: { name: "Café Sky", rating: "4.6", count: "1,203", price: "$$", recommended: true } },
      { title: "Subir al Cerro de la Cruz", place: null },
    ],
  },
  {
    title: "Mercado y ruinas",
    budget: budget("low"),
    votes: 1,
    mine: false,
    steps: [{ title: "Almuerzo en el mercado", place: null }],
  },
];
</script>

<template>
  <figure class="relative mx-auto w-full max-w-85 pt-32">
    <figcaption class="sr-only">
      Ejemplo: un plan compartido en WhatsApp y la página donde el grupo vota
      entre propuestas de la IA.
    </figcaption>

    <div aria-hidden="true">
      <!-- Phone with the voting page -->
      <div class="overflow-hidden rounded-[2.2rem] border-[7px] border-[#1C1917] bg-white text-[#1C1917] shadow-2xl">
        <div class="space-y-3 px-4 pb-5 pt-12">
          <div>
            <p class="text-lg font-extrabold tracking-tight">Sábado en Antigua</p>
            <p class="text-xs text-[#78716C]">Antigua Guatemala · sáb 14 oct</p>
          </div>
          <p class="text-sm font-bold">Voten por un plan</p>

          <div
            v-for="proposal in proposals"
            :key="proposal.title"
            class="rounded-xl border p-3"
            :class="proposal.mine ? 'border-2 border-[#FFA51F]' : 'border-[#E7E5E4]'"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-extrabold">{{ proposal.title }}</p>
              <span class="shrink-0 rounded-md bg-[#FFF2DB] px-1.5 py-0.5 text-[10px] font-bold text-[#8A5000]">
                {{ proposal.budget }}
              </span>
            </div>
            <ol class="mt-2 space-y-1.5">
              <li v-for="(step, index) in proposal.steps" :key="step.title" class="flex gap-2">
                <span class="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F4] text-[9px] font-bold">
                  {{ index + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold">{{ step.title }}</p>
                  <div v-if="step.place" class="mt-1 rounded-md border border-[#EEEEEE] px-2 py-1 text-[11px]">
                    <span class="font-bold">📍 {{ step.place.name }}</span>
                    <span v-if="step.place.recommended" class="ml-1 rounded bg-[#E7F6EC] px-1 text-[9px] font-bold text-[#0B7A3B]">
                      Recomendado
                    </span>
                    <p class="text-[#78716C]">⭐ {{ step.place.rating }} ({{ step.place.count }}) · {{ step.place.price }}</p>
                  </div>
                </div>
              </li>
            </ol>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-[11px] text-[#78716C]">{{ proposal.votes === 1 ? "1 voto" : `${proposal.votes} votos` }}</span>
              <span
                class="rounded-md px-2 py-0.5 text-[11px] font-bold"
                :class="proposal.mine ? 'bg-[#FFA51F] text-[#2B1A00]' : 'border border-[#FFA51F] text-[#2B1A00]'"
              >
                {{ proposal.mine ? "✓ Tu voto" : "👍 Votar" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating WhatsApp bubble with the link preview -->
      <div class="absolute left-0 top-0 w-[78%] -translate-x-2 rounded-xl bg-[#D9FDD3] p-1.5 shadow-xl sm:-translate-x-8">
        <div class="overflow-hidden rounded-lg">
          <div class="bg-[#FFA51F] p-3 text-[#2B1A00]">
            <div class="flex items-center justify-between text-[10px] font-extrabold">
              <span class="inline-flex items-center gap-1">
                <AppLogo variant="dark" :size="14" :wordmark="false" />
                MapMyTrip
              </span>
              <span class="rounded-full bg-[#1C1917] px-2 py-0.5 text-white">Plan en grupo</span>
            </div>
            <p class="mt-2 text-base font-extrabold leading-tight tracking-tight">Sábado en Antigua</p>
            <p class="text-[10px] font-semibold opacity-80">Antigua Guatemala · sáb 14 oct</p>
          </div>
          <div class="bg-[#F7F7F7] px-2 py-1 text-[10px] text-[#555555]">mapmytrip.app</div>
        </div>
        <p class="px-1 pt-1 text-[11px] text-[#111111]">voten aquí 👇</p>
      </div>
    </div>
  </figure>
</template>
