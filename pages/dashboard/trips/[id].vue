<script setup lang="ts">
import GoogleMap from "~/components/Map/GoogleMap.vue";

definePageMeta({
  layout: "authenticated",
});
</script>

<template>
  <div>
    <h1>Trip Details</h1>

    <GoogleMap />

    <!-- Additional trip details can be displayed here -->
  </div>
</template>
