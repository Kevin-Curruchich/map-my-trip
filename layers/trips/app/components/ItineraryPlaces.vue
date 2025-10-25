<script setup lang="ts">
import { importLibrary } from "@googlemaps/js-api-loader";

const mapContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
  activities:
    | {
        name: string;
        latitude: number;
        longitude: number;
      }[]
    | undefined;
  mapLocation: {
    lat: number;
    lng: number;
  };
}>();

onMounted(async () => {
  const { Map } = await importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await importLibrary("marker");

  if (mapContainer.value) {
    const map = new Map(mapContainer.value, {
      center: { lat: props.mapLocation.lat, lng: props.mapLocation.lng },
      zoom: 15,
      mapId: "d5e33afae207e196df9e7830",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    props?.activities?.forEach((activity, index) => {
      const pin = new PinElement({
        scale: 1.5,
        background: "#FF5722",
        borderColor: "#FFFFFF",
        glyphColor: "#FFFFFF",
        glyphText: `${index + 1}`,
      });

      new AdvancedMarkerElement({
        map: map,
        position: { lat: activity.latitude, lng: activity.longitude },
        content: pin.element,
      });
    });
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Map Container -->
    <UCard>
      <template #header>
        <div class="flex items-center">
          <UIcon name="i-lucide-map" class="h-5 w-5 text-primary mr-2" />
          <h2 class="text-lg font-semibold">Activity Map</h2>
        </div>
      </template>
      <div ref="mapContainer" class="w-full h-96 rounded-lg shadow-md" />
    </UCard>
  </div>
</template>

<style scoped>
.w-full {
  width: 100%;
}
.h-96 {
  height: 24rem;
}
</style>
