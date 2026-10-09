<script setup lang="ts">
// Wide cards span two columns on large screens to break the grid rhythm.
const features = [
  { icon: "i-lucide-map-pinned", title: "Propuestas con lugares reales", description: "Basadas en Google Places y en lugares que recomendamos, no en inventos de la IA.", wide: true },
  { icon: "i-lucide-chart-bar", title: "Votación en vivo", description: "Ves quién votó y qué va ganando." },
  { icon: "i-simple-icons-whatsapp", title: "Link con vista previa", description: "Llega a WhatsApp con título, lugar y fecha." },
  { icon: "i-lucide-wallet", title: "El presupuesto de cada quien", description: "La IA toma en cuenta cuánto puede gastar cada persona y qué le gustaría." },
  { icon: "i-lucide-calendar-check", title: "Lugar y fecha exactos", description: "Eliges el sitio en el mapa y el día." },
  { icon: "i-lucide-list", title: "Mis planes", description: "Tus viajes guardados y los planes de tus grupos, en un solo lugar.", wide: true },
];
</script>

<template>
  <section class="py-16 lg:py-24">
    <div class="container mx-auto px-4">
      <h2 class="reveal text-center text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
        Todo lo que hace por tu grupo
      </h2>
      <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="reveal rounded-2xl bg-elevated/60 p-6"
          :class="{ 'lg:col-span-2': feature.wide }"
        >
          <UIcon :name="feature.icon" class="size-7 text-mango-600" />
          <h3 class="mt-4 font-extrabold text-highlighted">{{ feature.title }}</h3>
          <p class="mt-1 text-sm text-muted">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
