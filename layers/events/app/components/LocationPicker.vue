<script setup lang="ts">
/// <reference types="google.maps" />
import { importLibrary } from "@googlemaps/js-api-loader";

interface Point {
  latitude: number;
  longitude: number;
}

const point = defineModel<Point | null>({ required: true });

// Guatemala City, until a point is set.
const DEFAULT_CENTER = { lat: 14.6349, lng: -90.5069 };

const mapContainer = useTemplateRef("mapContainer");
const config = useRuntimeConfig();
let map: google.maps.Map | undefined;
let marker: google.maps.marker.AdvancedMarkerElement | undefined;

function toLatLng(value: Point) {
  return { lat: value.latitude, lng: value.longitude };
}

onMounted(async () => {
  if (!mapContainer.value) return;
  const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
    importLibrary("maps"),
    importLibrary("marker"),
  ]);

  map = new Map(mapContainer.value, {
    center: point.value ? toLatLng(point.value) : DEFAULT_CENTER,
    zoom: point.value ? 16 : 12,
    mapId: config.public.googleMapsMapId,
    mapTypeControl: false,
    streetViewControl: false,
    clickableIcons: false,
  });

  marker = new AdvancedMarkerElement({
    map,
    gmpDraggable: true,
    position: point.value ? toLatLng(point.value) : null,
  });

  marker.addListener("dragend", () => {
    const position = marker?.position as google.maps.LatLngLiteral | null;
    if (position) point.value = { latitude: position.lat, longitude: position.lng };
  });

  map.addListener("click", (mapEvent: google.maps.MapMouseEvent) => {
    if (!mapEvent.latLng) return;
    point.value = {
      latitude: mapEvent.latLng.lat(),
      longitude: mapEvent.latLng.lng(),
    };
  });
});

// Points set from outside (search, pasted coordinates) move the map too.
watch(point, (value) => {
  if (!map || !marker) return;
  marker.position = value ? toLatLng(value) : null;
  if (value) map.panTo(toLatLng(value));
});
</script>

<template>
  <div ref="mapContainer" class="h-64 w-full rounded-lg border border-default" />
</template>
