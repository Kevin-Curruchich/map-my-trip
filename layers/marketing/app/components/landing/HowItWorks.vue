<script setup lang="ts">
const steps = [
  { icon: "i-lucide-map-pin-plus", title: "Crea el plan", description: "Qué, dónde y cuándo." },
  { icon: "i-simple-icons-whatsapp", title: "Compártelo en WhatsApp", description: "Cada quien dice su presupuesto y sus gustos, sin cuenta." },
  { icon: "i-lucide-vote", title: "La IA propone, el grupo vota", description: "Tres opciones con lugares reales; tú cierras la decisión." },
];
</script>

<template>
  <section id="como-funciona" class="scroll-mt-20 bg-elevated/50 py-16 lg:py-24">
    <div class="container mx-auto px-4">
      <h2 class="reveal text-center text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
        De “¿qué hacemos?” a plan cerrado en 3 pasos
      </h2>
      <ol class="mt-12 grid gap-6 md:grid-cols-3">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="reveal rounded-2xl border border-default bg-default p-6"
        >
          <div class="flex items-center gap-3">
            <span class="flex size-9 items-center justify-center rounded-full bg-primary font-extrabold text-mango-950">
              {{ index + 1 }}
            </span>
            <UIcon :name="step.icon" class="size-6 text-verde-600" />
          </div>
          <h3 class="mt-4 text-lg font-extrabold text-highlighted">{{ step.title }}</h3>
          <p class="mt-1 text-muted">{{ step.description }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
