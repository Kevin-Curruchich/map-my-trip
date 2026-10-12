<script setup lang="ts">
import { importLibrary } from "@googlemaps/js-api-loader";

const props = defineProps<{
  activities: ActivityWithPlace[];
  selectedId?: string | null;
}>();
const emit = defineEmits<{ select: [placeId: string] }>();

const mapContainer = useTemplateRef("mapContainer");
const config = useRuntimeConfig();

const PIN_COLOR = "#FF5722";
const SELECTED_PIN_COLOR = "#B23A10";

let map: google.maps.Map | undefined;
const pins: {
  placeId?: string;
  pin: google.maps.marker.PinElement;
  position: google.maps.LatLngLiteral;
}[] = [];

function highlightSelected() {
  for (const { placeId, pin, position } of pins) {
    const isSelected = !!placeId && placeId === props.selectedId;
    pin.scale = isSelected ? 2 : 1.5;
    pin.background = isSelected ? SELECTED_PIN_COLOR : PIN_COLOR;
    if (isSelected) map?.panTo(position);
  }
}

watch(() => props.selectedId, highlightSelected);

onMounted(async () => {
  if (!mapContainer.value) return;

  const [{ LatLngBounds }, { Map }, { AdvancedMarkerElement, PinElement }] =
    await Promise.all([
      importLibrary("core"),
      importLibrary("maps"),
      importLibrary("marker"),
    ]);

  map = new Map(mapContainer.value, {
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
      background: PIN_COLOR,
      borderColor: "#FFFFFF",
      glyphColor: "#FFFFFF",
      glyphText: `${index + 1}`,
    });

    const marker = new AdvancedMarkerElement({
      map,
      position,
      title: activity.name,
      content: pin.element,
      gmpClickable: true,
    });
    const placeId = activity.placeId;
    if (placeId) marker.addEventListener("gmp-click", () => emit("select", placeId));

    pins.push({ placeId, pin, position });
    bounds.extend(position);
  });

  if (props.activities.length > 0) {
    map.fitBounds(bounds);
  }
  highlightSelected();
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
