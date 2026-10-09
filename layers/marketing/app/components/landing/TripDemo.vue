<script setup lang="ts">
const days = [
  { day: "Día 1", items: ["Llegada y paseo por el Arco", "Cena en el centro"] },
  { day: "Día 2", items: ["Lancha a San Juan La Laguna", "Atardecer en Panajachel"] },
];
// Pin positions on the stylised map, in percent.
const pins = [
  { top: "28%", left: "30%" },
  { top: "52%", left: "58%" },
  { top: "70%", left: "38%" },
];
</script>

<template>
  <div
    class="grid gap-4 rounded-3xl border border-default bg-white p-4 text-[#1C1917] shadow-xl sm:grid-cols-2"
    role="img"
    aria-label="Ejemplo de itinerario de dos días con sus lugares en el mapa"
  >
    <div class="space-y-3" aria-hidden="true">
      <div v-for="day in days" :key="day.day" class="rounded-xl bg-[#F5F5F4] p-3">
        <p class="text-xs font-extrabold text-[#E58A00]">{{ day.day }}</p>
        <ul class="mt-1 space-y-1 text-sm">
          <li v-for="item in day.items" :key="item" class="flex gap-2">
            <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#12A150]" />
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
    <div class="relative min-h-48 overflow-hidden rounded-xl bg-[#E7F6EC]" aria-hidden="true">
      <div class="absolute inset-x-0 top-1/2 h-10 -rotate-12 bg-[#CFE3F5]" />
      <span
        v-for="(pin, index) in pins"
        :key="index"
        class="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFA51F] text-xs font-extrabold text-[#2B1A00] shadow"
        :style="pin"
      >
        {{ index + 1 }}
      </span>
    </div>
  </div>
</template>
