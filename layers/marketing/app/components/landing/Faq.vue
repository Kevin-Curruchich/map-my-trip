<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

const items: AccordionItem[] = [
  { label: "¿Mis amigos necesitan cuenta?", content: "No. Se unen y votan desde el link que compartes." },
  { label: "¿Por qué me pide entrar con Google?", content: "Para crear planes y usar la IA (proponer planes o crear un viaje). Así cada plan queda en tu cuenta y solo tú lo administras." },
  { label: "¿Cuánto cuesta?", content: "Puedes empezar gratis." },
  { label: "¿De dónde salen los lugares?", content: "De Google Places y de lugares que recomendamos." },
];
</script>

<template>
  <section class="py-16 lg:py-24">
    <div class="container mx-auto max-w-3xl px-4">
      <h2 class="reveal text-center text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
        Antes de empezar
      </h2>
      <UAccordion :items="items" class="reveal mt-10" />
    </div>
  </section>
</template>
