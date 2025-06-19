<script setup lang="ts">
const mapRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (!mapRef.value) {
    console.error("Map reference is not set.");
    return;
  }
  const map = new google.maps.Map(mapRef.value, {
    center: { lat: 14.7095552, lng: -90.9508608 },
    zoom: 15,
    fullscreenControl: false,
    mapTypeControl: false,
    mapId: "d5e33afae207e196df9e7830",
  });

  const service = new google.maps.places.PlacesService(map);
  const request = {
    location: { lat: 14.7095552, lng: -90.9508608 },
    radius: 1500,
    type: "restaurant",
  };

  service.nearbySearch(
    {
      location: request.location,
      radius: request.radius,
      type: request.type,
    },
    (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (!results || results.length === 0) {
          console.warn("No places found in the specified area.");
          return;
        }

        results.forEach((place) => {
          if (place.geometry && place.geometry.location) {
            new google.maps.marker.AdvancedMarkerElement({
              position: place.geometry.location,
              map: map,
              title: place.name,
            });
          }
        });
      } else {
        console.error("Places service failed due to: " + status);
      }
    }
  );
});
</script>

<template>
  <div class="border border-gray-300 rounded-lg shadow-md p-2 mx-auto">
    <div id="map" class="w-full h-96" ref="mapRef"></div>
  </div>
</template>
