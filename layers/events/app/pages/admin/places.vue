<script setup lang="ts">
import { eventBudgetOptions } from "~~/layers/events/shared/constants/event-options.constant";
import {
  type PartnerStatus,
  type PlaceCategory,
  partnerStatusOptions,
  placeCategoryOptions,
} from "~~/layers/events/shared/constants/place-options.constant";

definePageMeta({ middleware: "admin" });
useSeoMeta({ title: "Lugares recomendados", robots: "noindex" });

const toast = useToast();
const { data: rows, refresh, status } = await useFetch("/api/admin/places", {
  default: () => [],
});

type PlaceRow = (typeof rows.value)[number]["place"];

interface FormState {
  id?: string;
  name: string;
  description: string;
  category: PlaceCategory;
  tags: string[];
  // USelect clears to undefined; the API stores null.
  priceLevel: "low" | "medium" | "high" | undefined;
  address: string;
  point: { latitude: number; longitude: number } | null;
  googlePlaceId: string;
  instagram: string;
  whatsapp: string;
  website: string;
  partnerStatus: PartnerStatus;
  active: boolean;
  notes: string;
}

function emptyForm(): FormState {
  return {
    name: "",
    description: "",
    category: "restaurant",
    tags: [],
    priceLevel: undefined,
    address: "",
    point: null,
    googlePlaceId: "",
    instagram: "",
    whatsapp: "",
    website: "",
    partnerStatus: "prospect",
    active: true,
    notes: "",
  };
}

function formFromPlace(place: PlaceRow): FormState {
  return {
    id: place.id,
    name: place.name,
    description: place.description ?? "",
    category: place.category,
    tags: [...place.tags],
    priceLevel: place.priceLevel ?? undefined,
    address: place.address ?? "",
    point: { latitude: place.latitude, longitude: place.longitude },
    googlePlaceId: place.googlePlaceId ?? "",
    instagram: place.instagram ?? "",
    whatsapp: place.whatsapp ?? "",
    website: place.website ?? "",
    partnerStatus: place.partnerStatus,
    active: place.active,
    notes: place.notes ?? "",
  };
}

const isOpen = ref(false);
const isSaving = ref(false);
const form = reactive<FormState>(emptyForm());

function openForm(place?: PlaceRow) {
  Object.assign(form, place ? formFromPlace(place) : emptyForm());
  if (!place) form.id = undefined;
  coordinatesText.value = "";
  googleSearch.value = "";
  isOpen.value = true;
}

// Optional: when the place is already on Google, take its address and pin.
const googleSearch = ref("");
const { suggestions, isSearching, search, resolve } = useEventLocation();
watch(googleSearch, (query) => search(query));

const googleItems = computed(() =>
  suggestions.value.map((suggestion) => ({
    label: suggestion.name,
    description: suggestion.address,
    suggestion,
  }))
);

async function pickGooglePlace(item: (typeof googleItems.value)[number] | undefined) {
  if (!item) return;
  const resolved = await resolve(item.suggestion);
  if (resolved.latitude === undefined || resolved.longitude === undefined) return;
  form.name ||= item.suggestion.name;
  form.address = item.suggestion.address;
  form.googlePlaceId = resolved.placeId ?? "";
  form.point = { latitude: resolved.latitude, longitude: resolved.longitude };
}

// "14.5586, -90.7295", as Google Maps copies it on right click.
const coordinatesText = ref("");
watch(coordinatesText, (text) => {
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
    form.point = { latitude, longitude };
  }
});

async function save() {
  if (form.name.trim().length < 2 || !form.point) {
    toast.add({
      title: "Falta información",
      description: "El lugar necesita nombre y ubicación en el mapa.",
      color: "warning",
    });
    return;
  }

  const { id, point, ...fields } = form;
  const body = { ...fields, ...point, priceLevel: fields.priceLevel ?? null };
  isSaving.value = true;
  try {
    await $fetch(id ? `/api/admin/places/${id}` : "/api/admin/places", {
      method: id ? "PUT" : "POST",
      body,
    });
    isOpen.value = false;
    await refresh();
    toast.add({ title: id ? "Lugar actualizado" : "Lugar agregado", color: "success" });
  } catch (error) {
    console.error("Saving place failed:", error);
    toast.add({
      title: "No se pudo guardar",
      description: "Revisa los datos (por ejemplo, que el sitio web sea una URL).",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
}

async function remove() {
  if (!form.id || !confirm(`¿Eliminar "${form.name}"?`)) return;
  await $fetch(`/api/admin/places/${form.id}`, { method: "DELETE" });
  isOpen.value = false;
  await refresh();
}

const filter = ref("");
const filteredRows = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter(({ place }) =>
    [place.name, place.address, ...place.tags]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(q))
  );
});

function categoryOf(value: PlaceCategory) {
  return placeCategoryOptions.find((option) => option.value === value);
}
function statusOf(value: PartnerStatus) {
  return partnerStatusOptions.find((option) => option.value === value)!;
}
function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
</script>

<template>
  <UContainer class="max-w-3xl space-y-6 py-10">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Lugares recomendados</h1>
        <p class="text-muted">
          Se ofrecen a la IA junto con Google al armar los planes. Los aliados se
          prefieren cuando encajan y siempre se muestran como tales.
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="openForm()">Agregar lugar</UButton>
    </div>

    <UInput
      v-model="filter"
      icon="i-lucide-search"
      placeholder="Filtrar por nombre, dirección o etiqueta"
      class="w-full"
    />

    <UEmpty
      v-if="status !== 'pending' && filteredRows.length === 0"
      icon="i-lucide-map-pin-plus"
      title="Aún no hay lugares"
      description="Agrega lugares nuevos que todavía no aparecen en Google."
    />

    <div class="space-y-3">
      <UCard
        v-for="{ place, appearances, wins } in filteredRows"
        :key="place.id"
        :class="{ 'opacity-60': !place.active }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <UIcon :name="categoryOf(place.category)?.icon ?? 'i-lucide-map-pin'" />
              <h2 class="font-semibold">{{ place.name }}</h2>
              <UBadge :color="statusOf(place.partnerStatus).color" variant="subtle" size="sm">
                {{ statusOf(place.partnerStatus).label }}
              </UBadge>
              <UBadge v-if="!place.active" color="neutral" variant="outline" size="sm">
                Inactivo
              </UBadge>
            </div>
            <p v-if="place.address" class="truncate text-sm text-muted">
              {{ place.address }}
            </p>
            <div v-if="place.tags.length" class="mt-2 flex flex-wrap gap-1">
              <UBadge
                v-for="tag in place.tags"
                :key="tag"
                color="neutral"
                variant="soft"
                size="sm"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>
          <UButton
            icon="i-lucide-pencil"
            variant="ghost"
            color="neutral"
            aria-label="Editar"
            @click="openForm(place)"
          />
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-eye" />
            {{ appearances }} {{ appearances === 1 ? "propuesta" : "propuestas" }}
          </span>
          <span class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-trophy" />
            {{ wins }} {{ wins === 1 ? "plan ganador" : "planes ganadores" }}
          </span>
          <ULink
            v-if="place.whatsapp"
            :to="whatsappUrl(place.whatsapp)"
            target="_blank"
            class="inline-flex items-center gap-1"
          >
            <UIcon name="i-simple-icons-whatsapp" /> Contactar
          </ULink>
        </div>
      </UCard>
    </div>

    <USlideover
      v-model:open="isOpen"
      :title="form.id ? 'Editar lugar' : 'Agregar lugar'"
      :ui="{ content: 'max-w-xl' }"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="save">
          <UFormField label="Nombre" required>
            <UInput v-model="form.name" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Categoría" required>
              <USelect
                v-model="form.category"
                :items="placeCategoryOptions"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Precio por persona">
              <USelect
                v-model="form.priceLevel"
                :items="eventBudgetOptions"
                placeholder="Sin definir"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField
            label="¿Por qué lo recomiendas?"
            help="Lo ven las personas y la IA lo usa para decidir cuándo encaja."
          >
            <UTextarea v-model="form.description" :rows="2" autoresize class="w-full" />
          </UFormField>

          <UFormField label="Etiquetas" help="Ej.: vista al volcán, pet friendly, música en vivo">
            <UInputTags v-model="form.tags" class="w-full" />
          </UFormField>

          <USeparator label="Ubicación" />

          <UFormField
            label="¿Ya está en Google? (opcional)"
            help="Toma la dirección y el punto exacto de Google."
          >
            <UInputMenu
              v-model:search-term="googleSearch"
              :items="googleItems"
              :loading="isSearching"
              ignore-filter
              icon="i-simple-icons-googlemaps"
              placeholder="Buscar en Google Maps"
              class="w-full"
              @update:model-value="pickGooglePlace"
            />
          </UFormField>

          <UFormField label="Dirección">
            <UInput v-model="form.address" class="w-full" />
          </UFormField>

          <UFormField
            label="Punto en el mapa"
            required
            help="Toca el mapa o arrastra el pin. También puedes pegar coordenadas."
          >
            <div class="space-y-2">
              <ClientOnly>
                <LocationPicker v-model="form.point" />
              </ClientOnly>
              <UInput
                v-model="coordinatesText"
                placeholder="14.5586, -90.7295"
                icon="i-lucide-crosshair"
                class="w-full"
              />
              <p v-if="form.point" class="text-xs text-muted">
                {{ form.point.latitude.toFixed(6) }}, {{ form.point.longitude.toFixed(6) }}
              </p>
            </div>
          </UFormField>

          <USeparator label="Contacto y relación comercial" />

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Instagram">
              <UInput v-model="form.instagram" placeholder="@lugar" class="w-full" />
            </UFormField>
            <UFormField label="WhatsApp">
              <UInput v-model="form.whatsapp" placeholder="+502 5555 5555" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Sitio web">
            <UInput v-model="form.website" type="url" placeholder="https://" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Estado">
              <USelect
                v-model="form.partnerStatus"
                :items="partnerStatusOptions"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Visible en propuestas">
              <USwitch v-model="form.active" class="mt-1.5" />
            </UFormField>
          </div>

          <UFormField label="Notas internas" help="Solo las ves tú.">
            <UTextarea v-model="form.notes" :rows="3" autoresize class="w-full" />
          </UFormField>

          <div class="flex justify-between gap-3 pt-2">
            <UButton
              v-if="form.id"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              @click="remove"
            >
              Eliminar
            </UButton>
            <UButton type="submit" :loading="isSaving" class="ml-auto">
              Guardar
            </UButton>
          </div>
        </form>
      </template>
    </USlideover>
  </UContainer>
</template>
