<script setup lang="ts">
const props = defineProps<{
  place: PlaceRef;
  // What the page already knows, shown while loading or if Google fails.
  fallback?: { name: string; address: string | null };
}>();
defineEmits<{ close: [] }>();

const { data: info, status } = useFetch("/api/places/details", {
  query: { source: props.place.source, id: props.place.id },
  key: `place-${props.place.source}-${props.place.id}`,
  lazy: true,
  // Reopening a place during this visit reuses what was fetched.
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
});

const name = computed(() => info.value?.name || props.fallback?.name || "");
const address = computed(() => info.value?.address ?? props.fallback?.address ?? null);
const fallbackMapsUrl = computed(() =>
  props.place.source === "google"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name.value)}&query_place_id=${props.place.id}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name.value)}`
);

// Photo names expire; a broken one is dropped instead of shown empty.
const failedPhotos = ref(new Set<string>());
const photos = computed(
  () => info.value?.photos.filter((photo) => !failedPhotos.value.has(photo.name)) ?? []
);

function photoUrl(photoName: string) {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}&w=800`;
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold text-highlighted">{{ name }}</h2>
        <p v-if="address" class="text-sm text-muted">{{ address }}</p>
      </div>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        aria-label="Cerrar"
        @click="$emit('close')"
      />
    </div>

    <div v-if="status === 'idle' || status === 'pending'" class="space-y-3">
      <USkeleton class="aspect-video w-full" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="h-4 w-1/3" />
    </div>

    <UAlert
      v-else-if="status === 'error' || !info"
      icon="i-lucide-cloud-off"
      color="neutral"
      variant="subtle"
      title="No pudimos cargar los detalles de este lugar."
      :actions="[
        {
          label: 'Abrir en Google Maps',
          to: fallbackMapsUrl,
          target: '_blank',
          icon: 'i-lucide-map-pin',
        },
      ]"
    />

    <template v-else>
      <UCarousel
        v-if="photos.length"
        v-slot="{ item }"
        :items="photos"
        arrows
        :ui="{ prev: 'start-2', next: 'end-2' }"
        class="w-full"
      >
        <figure>
          <img
            :src="photoUrl(item.name)"
            :alt="`Foto de ${info.name}`"
            loading="lazy"
            class="aspect-video w-full rounded-lg object-cover"
            @error="failedPhotos.add(item.name)"
          >
          <figcaption v-if="item.authors.length" class="mt-1 text-xs text-muted">
            Foto:
            <template v-for="(author, index) in item.authors" :key="index">
              <ULink v-if="author.uri" :to="author.uri" target="_blank">
                {{ author.name }}
              </ULink>
              <span v-else>{{ author.name }}</span>
            </template>
          </figcaption>
        </figure>
      </UCarousel>

      <div class="flex flex-wrap items-center gap-2 text-sm">
        <UBadge
          v-if="info.partner"
          color="primary"
          variant="subtle"
          icon="i-lucide-handshake"
        >
          Aliado MapMyTrip
        </UBadge>
        <UBadge
          v-else-if="info.source === 'recommended'"
          color="success"
          variant="subtle"
          icon="i-lucide-sparkles"
        >
          Recomendado
        </UBadge>
        <span v-if="info.rating" class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-star" class="text-warning" />
          {{ info.rating.toFixed(1) }}
          <span v-if="info.ratingCount" class="text-muted">({{ info.ratingCount }})</span>
        </span>
        <UBadge
          v-if="info.openNow !== null"
          :color="info.openNow ? 'success' : 'error'"
          variant="soft"
        >
          {{ info.openNow ? "Abierto ahora" : "Cerrado ahora" }}
        </UBadge>
      </div>

      <p v-if="info.description" class="text-sm">{{ info.description }}</p>

      <details v-if="info.weekdayHours.length" class="text-sm">
        <summary class="cursor-pointer font-medium">Horario</summary>
        <ul class="mt-1 space-y-0.5 text-muted">
          <li v-for="line in info.weekdayHours" :key="line">{{ line }}</li>
        </ul>
      </details>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="info.phone"
          :to="`tel:${info.phone.replace(/\s/g, '')}`"
          icon="i-lucide-phone"
          size="sm"
          color="neutral"
          variant="outline"
        >
          Llamar
        </UButton>
        <UButton
          v-if="info.website"
          :to="info.website"
          target="_blank"
          icon="i-lucide-globe"
          size="sm"
          color="neutral"
          variant="outline"
        >
          Sitio web
        </UButton>
        <UButton
          v-if="info.whatsapp"
          :to="whatsappUrl(info.whatsapp)"
          target="_blank"
          icon="i-simple-icons-whatsapp"
          size="sm"
          color="neutral"
          variant="outline"
        >
          WhatsApp
        </UButton>
        <UButton
          v-if="info.instagram"
          :to="instagramUrl(info.instagram)"
          target="_blank"
          icon="i-simple-icons-instagram"
          size="sm"
          color="neutral"
          variant="outline"
        >
          Instagram
        </UButton>
        <UButton :to="info.mapsUrl" target="_blank" icon="i-lucide-map-pin" size="sm">
          Abrir en Google Maps
        </UButton>
      </div>

      <section v-if="info.reviews.length" class="space-y-3">
        <h3 class="font-semibold">Reseñas</h3>
        <article
          v-for="(review, index) in info.reviews"
          :key="index"
          class="space-y-1 text-sm"
        >
          <div class="flex flex-wrap items-center gap-2">
            <!-- Google's avatar host refuses requests that carry our referrer. -->
            <UAvatar
              :src="review.authorPhoto ?? undefined"
              :alt="review.author"
              size="xs"
              referrerpolicy="no-referrer"
            />
            <ULink
              v-if="review.authorUri"
              :to="review.authorUri"
              target="_blank"
              class="font-medium"
            >
              {{ review.author }}
            </ULink>
            <span v-else class="font-medium">{{ review.author }}</span>
            <span class="text-muted">{{ review.rating }}★ · {{ review.when }}</span>
          </div>
          <p class="text-muted">{{ review.text }}</p>
        </article>
        <p class="text-xs text-dimmed">
          Ordenadas por relevancia, según Google.
          <ULink :to="info.mapsUrl" target="_blank" class="underline">
            Ver todas en Google Maps
          </ULink>
        </p>
      </section>

      <!-- Required by Google when Places data is shown outside its map. -->
      <p v-if="info.fromGoogle" class="text-xs text-dimmed" style="font-family: Roboto, sans-serif">
        Google Maps
      </p>
    </template>
  </div>
</template>
