<script lang="ts" setup>
import {
  type CalendarDate,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import type { EventLocation } from "~~/layers/events/app/composables/useEventLocation";

useSeoMeta({
  title: "Crear un plan en grupo",
  description:
    "Crea un evento, comparte el link en tu grupo de WhatsApp y decidan juntos qué hacer.",
});

const title = ref("");
const description = ref("");
const location = ref<EventLocation>();
const locationSearch = ref("");
const date = shallowRef<CalendarDate>();
const minDate = today(getLocalTimeZone());

const errors = reactive({ title: "", location: "" });
const isLoading = ref(false);
const toast = useToast();

const { suggestions, isSearching, isLocating, search, resolve, locate } =
  useEventLocation();
const { saveOwnerToken } = useEventOwner();

interface LocationItem {
  label: string;
  description: string;
  suggestion?: (typeof suggestions.value)[number];
}

const locationItems = computed<LocationItem[]>(() =>
  suggestions.value.map((suggestion) => ({
    label: suggestion.name,
    description: suggestion.address,
    suggestion,
  }))
);

// Coordinates arrive a moment after a suggestion is picked; submit waits.
let resolving: Promise<void> | undefined;

const selectedLocationItem = computed<LocationItem | undefined>({
  get: () =>
    location.value ? { label: location.value.label, description: "" } : undefined,
  set: (item) => {
    pickedLabel = item?.label;
    errors.location = "";
    if (!item?.suggestion) {
      location.value = undefined;
      return;
    }
    const picked = item.suggestion;
    location.value = { label: picked.name, placeId: picked.placeId };
    resolving = resolve(picked).then((resolved) => {
      // Only if the user didn't pick something else meanwhile.
      if (location.value?.placeId === picked.placeId) location.value = resolved;
    });
  },
});

// The menu writes the picked item's label into the search box, so any other
// text there means the user typed a place without picking a suggestion.
let pickedLabel: string | undefined;
watch(locationSearch, (query) => {
  // Picking writes the label into the box; that isn't a new search.
  if (query === pickedLabel || query === location.value?.label) return;
  search(query);
});
watch(title, () => (errors.title = ""));

async function useMyLocation() {
  try {
    location.value = await locate();
    pickedLabel = location.value.label;
    errors.location = "";
  } catch {
    toast.add({
      title: "No pudimos obtener tu ubicación",
      description: "Revisa el permiso del navegador o escribe el lugar.",
      color: "warning",
    });
  }
}

const dateLabel = computed(() =>
  date.value ? formatEventDate(date.value.toString()) : "Elegir fecha"
);

function validate() {
  errors.title =
    title.value.trim().length >= 3 ? "" : "Mínimo 3 caracteres";
  // A typed place that wasn't picked from the list is still accepted as text.
  const typed = locationSearch.value.trim();
  const isPicked =
    !!location.value &&
    (typed === pickedLabel || typed === location.value.label);
  if (!isPicked && typed.length >= 2) location.value = { label: typed };
  errors.location = location.value ? "" : "¿Dónde será el plan?";
  return !errors.title && !errors.location;
}

async function onSubmit() {
  if (!validate()) return;

  isLoading.value = true;
  try {
    await resolving;
    const { slug, ownerToken } = await $fetch("/api/events", {
      method: "POST",
      body: {
        title: title.value,
        location: location.value!,
        date: date.value?.toString(),
        description: description.value || undefined,
      },
    });
    if (ownerToken) saveOwnerToken(slug, ownerToken);
    await navigateTo(`/e/${slug}`);
  } catch (error) {
    console.error("Error creating event:", error);
    toast.add({
      title: "No pudimos crear el evento",
      description: "Inténtalo de nuevo en un momento.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UContainer class="max-w-xl py-10">
    <h1 class="text-2xl font-bold mb-2">¿Qué hacemos?</h1>
    <p class="text-muted mb-6">
      Crea el evento y comparte el link en tu grupo. Cada quien dice qué quiere
      y cuánto puede gastar, sin instalar nada.
    </p>

    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <UFormField label="Nombre del plan" :error="errors.title || undefined" required>
        <UInput v-model="title" placeholder="Salida del sábado" class="w-full" />
      </UFormField>

      <UFormField label="¿Dónde?" :error="errors.location || undefined" required>
        <div class="flex flex-col gap-2">
          <UInputMenu
            v-model="selectedLocationItem"
            v-model:search-term="locationSearch"
            :items="locationItems"
            :loading="isSearching"
            ignore-filter
            icon="i-lucide-map-pin"
            placeholder="Busca un lugar, zona o ciudad"
            class="w-full"
          >
            <template #empty>
              {{
                locationSearch.trim().length < 2
                  ? "Escribe para buscar"
                  : "Sin resultados; se usará lo que escribiste"
              }}
            </template>
          </UInputMenu>
          <UButton
            icon="i-lucide-locate-fixed"
            variant="ghost"
            size="sm"
            class="self-start"
            :loading="isLocating"
            @click="useMyLocation"
          >
            Usar mi ubicación
          </UButton>
        </div>
      </UFormField>

      <UFormField label="¿Cuándo?">
        <UPopover>
          <UButton
            icon="i-lucide-calendar"
            color="neutral"
            variant="outline"
            block
            class="justify-start"
            :class="{ 'text-dimmed': !date }"
          >
            {{ dateLabel }}
          </UButton>
          <template #content>
            <UCalendar v-model="date" :min-value="minDate" locale="es" class="p-2" />
          </template>
        </UPopover>
      </UFormField>

      <UFormField label="Detalles">
        <UTextarea
          v-model="description"
          placeholder="Cumpleaños de Ana, somos como 6"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" size="lg" block :loading="isLoading">
        Crear y compartir
      </UButton>
    </form>
  </UContainer>
</template>
