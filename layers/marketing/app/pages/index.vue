<script setup lang="ts">
useSeoMeta({
  title: "MapMyTrip · Decidan juntos qué hacer",
  description:
    "Crea un plan, compártelo en WhatsApp y la IA propone opciones con lugares reales. El grupo vota y tú cierras la decisión.",
  ogTitle: "MapMyTrip · Decidan juntos qué hacer",
  ogDescription:
    "Planes en grupo con IA: la IA propone, el grupo vota desde WhatsApp.",
});

defineOgImage("Landing");
</script>

<template>
  <div>
    <LandingHero />
    <LandingHowItWorks />
    <LandingFeatures />
    <LandingTrips />
    <LandingFaq />
    <LandingFinalCta />
    <LandingFooter />
  </div>
</template>
