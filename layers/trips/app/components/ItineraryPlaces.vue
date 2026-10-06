<script setup lang="ts">
import { importLibrary } from "@googlemaps/js-api-loader";

const props = defineProps<{
  activities: ActivityWithPlace[];
}>();

const mapContainer = useTemplateRef("mapContainer");
const config = useRuntimeConfig();

onMounted(async () => {
  if (!mapContainer.value) return;

  const [{ LatLngBounds }, { Map }, { AdvancedMarkerElement, PinElement }] =
    await Promise.all([
      importLibrary("core"),
      importLibrary("maps"),
      importLibrary("marker"),
    ]);

  const map = new Map(mapContainer.value, {
    zoom: 15,
    mapId: config.public.googleMapsMapId,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  const bounds = new LatLngBounds();

  props.activities.forEach((activity, index) => {
    const position = { lat: activity.latitude, lng: activity.longitude };
    const pin = new PinElement({
      scale: 1.5,
      background: "#FF5722",
      borderColor: "#FFFFFF",
      glyphColor: "#FFFFFF",
      glyphText: `${index + 1}`,
    });

    new AdvancedMarkerElement({
      map,
      position,
      title: activity.name,
      content: pin.element,
    });
    bounds.extend(position);
  });

  if (props.activities.length > 0) {
    map.fitBounds(bounds);
  }
});
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-map" class="size-5 text-primary" />
        <h2 class="text-lg font-semibold">Activity Map</h2>
      </div>
    </template>
    <div ref="mapContainer" class="h-96 w-full rounded-lg shadow-md" />
  </UCard>
</template>
