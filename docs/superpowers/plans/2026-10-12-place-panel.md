# Place Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open any place of a trip itinerary or an event proposal inside the app (photos, rating, hours, reviews, contact), side by side with the itinerary on desktop and in a bottom sheet on mobile, with the open place in a shareable `?place=` URL.

**Architecture:** One server endpoint in the events layer turns a `{ source, id }` into a `PlaceInfo` (our `recommended_places` row and/or one Google Place Details call), and a second one redirects to Google photo images so the key stays on the server. A shared `PlacePanel` component and two small composables live in `layers/base`; the trip and event pages put it in a sticky right column (desktop) or a `UDrawer` (mobile), driven by `?place=`.

**Tech Stack:** Nuxt 4 layers, Nuxt UI 4 (`UCarousel`, `UDrawer`, `UTimeline`), Nitro routes with zod validation, Drizzle (Postgres), Google Places API (New), Maps JS API (`@googlemaps/js-api-loader`).

**Spec:** `docs/superpowers/specs/2026-10-12-place-panel-design.md`

## Global Constraints

- No unit tests in this project yet (owner's decision). Every task verifies with `pnpm typecheck`, `pnpm lint` and a manual check on the dev server (`pnpm dev`, http://localhost:3000). This replaces the TDD steps.
- The Google key (`googlePlacesApiKey`) never reaches the browser. Photos go through `/api/places/photo`.
- No server cache of Places content or photo names (Google policy). The only client reuse is Nuxt's payload within one visit.
- One Place Details call per panel open, field mask exactly: `id,displayName,formattedAddress,googleMapsUri,photos,rating,userRatingCount,nationalPhoneNumber,websiteUri,currentOpeningHours,regularOpeningHours,reviews`, with `languageCode=es`.
- Google attribution: photo authors under each photo, review author avatar + name + link, the note "Ordenadas por relevancia, según Google" with "Ver todas en Google Maps", and the text "Google Maps" when `fromGoogle`.
- The open place lives in `?place=<source>:<id>`; a value that is not a place of the current trip/event is ignored.
- Desktop = Tailwind `lg` (≥1024px). Below `lg` the panel opens in a `UDrawer`.
- UI copy in Spanish; code, comments and commits in English, Conventional Commits, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Follow nearby code: default-exported composables named after the file, comments only for the why, `getValidatedQuery(event, Schema.parse)` in routes.

## Review Focus

1. Google refusing a call (the daily quota cap the owner sets returns 429, or an expired key) → the panel shows the name it already knows and "Abrir en Google Maps", never a blank or a crash. Checked in Task 2 step 5 and Task 3 step 6.
2. A shared link with `?place=` for a place that is not in that trip/event → nothing opens and no `/api/places/details` request is made. Checked in Task 3 step 6 and Task 4 step 5.
3. Mobile Back button with the sheet open → the sheet closes and the page stays; switching from one place to another and pressing Back once also closes (no history pile-up). Checked in Task 3 step 6.
4. A recommended place without `googlePlaceId`, or deactivated → our data only, or the 404 fallback; no Google call. Checked in Task 1 step 7 and Task 4 step 5.
5. A photo that fails to load (photo names expire) → that slide disappears; with none left, no carousel. Checked in Task 2 step 5.

---

### Task 1: Place info and photo endpoints

**Files:**
- Create: `layers/base/shared/types/place.ts`
- Modify: `layers/events/server/utils/google-places.ts` (append after `getPlaceDetails`)
- Modify: `layers/events/server/schemas.ts` (after `PlaceDetailsQuerySchema`)
- Create: `layers/events/server/services/place-info.service.ts`
- Create: `layers/events/server/api/places/details.get.ts`
- Create: `layers/events/server/api/places/photo.get.ts`

**Interfaces:**
- Produces: types `PlaceRef`, `PlaceInfo` (auto-imported from `layers/base/shared/types`); `GET /api/places/details?source=google|recommended&id=…` → `PlaceInfo`; `GET /api/places/photo?name=<photo name>&w=<200..1200>` → 302 to the image.

- [ ] **Step 1: Shared types**

Create `layers/base/shared/types/place.ts`:

```ts
// A place a page can open in the place panel: a Google place id, or the uuid
// of one of our recommended places.
export interface PlaceRef {
  source: "google" | "recommended";
  id: string;
}

export interface PlaceInfo extends PlaceRef {
  name: string;
  address: string | null;
  mapsUrl: string;
  rating: number | null;
  ratingCount: number | null;
  phone: string | null;
  website: string | null;
  // Recommended places only.
  description: string | null;
  instagram: string | null;
  whatsapp: string | null;
  partner: boolean;
  // From Google, when the place is on it.
  openNow: boolean | null;
  // Google's own lines in Spanish, e.g. "lunes: 8:00–17:00".
  weekdayHours: string[];
  photos: { name: string; authors: { name: string; uri: string | null }[] }[];
  reviews: {
    author: string;
    authorUri: string | null;
    authorPhoto: string | null;
    rating: number;
    text: string;
    when: string;
  }[];
  // Shows the "Google Maps" attribution.
  fromGoogle: boolean;
}
```

- [ ] **Step 2: Google calls**

Append to `layers/events/server/utils/google-places.ts`, after `getPlaceDetails`:

```ts
interface GoogleAuthor {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

export type GooglePlaceProfile = Pick<
  PlaceInfo,
  | "name"
  | "address"
  | "mapsUrl"
  | "rating"
  | "ratingCount"
  | "phone"
  | "website"
  | "openNow"
  | "weekdayHours"
  | "photos"
  | "reviews"
>;

// Everything the place panel shows, in one Place Details call. Reviews make
// it an Enterprise + Atmosphere request; nothing here may be cached.
export async function getPlaceProfile(placeId: string): Promise<GooglePlaceProfile> {
  const place = await placesFetch<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    rating?: number;
    userRatingCount?: number;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    currentOpeningHours?: { openNow?: boolean };
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    photos?: { name: string; authorAttributions?: GoogleAuthor[] }[];
    reviews?: {
      rating?: number;
      text?: { text: string };
      relativePublishTimeDescription?: string;
      authorAttribution?: GoogleAuthor;
    }[];
  }>(
    `/places/${encodeURIComponent(placeId)}`,
    "id,displayName,formattedAddress,googleMapsUri,photos,rating,userRatingCount,nationalPhoneNumber,websiteUri,currentOpeningHours,regularOpeningHours,reviews",
    { query: { languageCode: "es", regionCode: REGION } }
  );

  return {
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? null,
    mapsUrl:
      place.googleMapsUri ??
      `https://www.google.com/maps/place/?q=place_id:${place.id}`,
    rating: place.rating ?? null,
    ratingCount: place.userRatingCount ?? null,
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    openNow: place.currentOpeningHours?.openNow ?? null,
    weekdayHours: place.regularOpeningHours?.weekdayDescriptions ?? [],
    photos: (place.photos ?? []).map((photo) => ({
      name: photo.name,
      authors: (photo.authorAttributions ?? []).map((author) => ({
        name: author.displayName ?? "",
        uri: author.uri ?? null,
      })),
    })),
    reviews: (place.reviews ?? []).flatMap((review) =>
      review.text?.text
        ? [
            {
              author: review.authorAttribution?.displayName ?? "",
              authorUri: review.authorAttribution?.uri ?? null,
              authorPhoto: review.authorAttribution?.photoUri ?? null,
              rating: review.rating ?? 0,
              text: review.text.text,
              when: review.relativePublishTimeDescription ?? "",
            },
          ]
        : []
    ),
  };
}

// The image URL of a photo, so the browser loads it without our key.
// https://developers.google.com/maps/documentation/places/web-service/place-photos
export async function getPhotoUri(name: string, width: number) {
  const { photoUri } = await $fetch<{ photoUri: string }>(
    `${PLACES_API}/${name}/media`,
    {
      query: { maxWidthPx: width, skipHttpRedirect: "true" },
      headers: { "X-Goog-Api-Key": useRuntimeConfig().googlePlacesApiKey },
    }
  );
  return photoUri;
}
```

- [ ] **Step 3: Validation schemas**

In `layers/events/server/schemas.ts`, after `PlaceDetailsQuerySchema`:

```ts
// A place the panel can open: a Google place id or one of our places.
export const PlaceInfoQuerySchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("google"), id: z.string().regex(/^[\w-]{10,300}$/) }),
  z.object({ source: z.literal("recommended"), id: z.uuid() }),
]);

// Photo names come from a Place Details response: places/<id>/photos/<id>.
export const PlacePhotoQuerySchema = z.object({
  name: z.string().regex(/^places\/[\w-]{10,300}\/photos\/[\w-]{10,1000}$/),
  w: z.coerce.number().int().min(200).max(1200).default(800),
});
```

- [ ] **Step 4: Service**

Create `layers/events/server/services/place-info.service.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { toStepPlace } from "./recommended-places.service";

const NOT_RECOMMENDED = {
  description: null,
  instagram: null,
  whatsapp: null,
  partner: false,
};

// What the place panel shows. A recommended place adds Google's photos,
// hours and reviews when the admin linked it to its Google place.
export async function getPlaceInfo(place: PlaceRef): Promise<PlaceInfo> {
  if (place.source === "google") {
    const google = await getPlaceProfile(place.id).catch((error) => {
      console.error(`Place details failed for ${place.id}:`, error);
      throw createError({ statusCode: 502, statusMessage: "Google Places failed" });
    });
    return { ...place, ...NOT_RECOMMENDED, ...google, fromGoogle: true };
  }

  const t = tables.recommendedPlaces;
  const ours = await useDb().query.recommendedPlaces.findFirst({
    where: and(eq(t.id, place.id), eq(t.active, true)),
  });
  if (!ours) {
    throw createError({ statusCode: 404, statusMessage: "Place not found" });
  }

  // Our own data is still worth showing when Google fails.
  const google = ours.googlePlaceId
    ? await getPlaceProfile(ours.googlePlaceId).catch((error) => {
        console.error(`Place details failed for ${ours.googlePlaceId}:`, error);
        return null;
      })
    : null;

  return {
    ...place,
    name: ours.name,
    address: ours.address ?? google?.address ?? null,
    mapsUrl: google?.mapsUrl ?? toStepPlace(ours).mapsUrl,
    rating: google?.rating ?? null,
    ratingCount: google?.ratingCount ?? null,
    phone: google?.phone ?? null,
    website: ours.website ?? google?.website ?? null,
    description: ours.description,
    instagram: ours.instagram,
    whatsapp: ours.whatsapp,
    partner: ours.partnerStatus === "partner",
    openNow: google?.openNow ?? null,
    weekdayHours: google?.weekdayHours ?? [],
    photos: google?.photos ?? [],
    reviews: google?.reviews ?? [],
    fromGoogle: google !== null,
  };
}
```

- [ ] **Step 5: Routes**

Create `layers/events/server/api/places/details.get.ts` (static `details` wins over the sibling `[placeId].get.ts`):

```ts
import { PlaceInfoQuerySchema } from "../../schemas";
import { getPlaceInfo } from "../../services/place-info.service";

// Open to anyone with a trip or event link; the daily quota cap in Google
// Cloud Console bounds what a scraper could cost.
export default defineEventHandler(async (event) => {
  const place = await getValidatedQuery(event, PlaceInfoQuerySchema.parse);
  return getPlaceInfo(place);
});
```

Create `layers/events/server/api/places/photo.get.ts`:

```ts
import { PlacePhotoQuerySchema } from "../../schemas";

export default defineEventHandler(async (event) => {
  const { name, w } = await getValidatedQuery(event, PlacePhotoQuerySchema.parse);
  const uri = await getPhotoUri(name, w).catch((error) => {
    console.error(`Place photo failed for ${name}:`, error);
    throw createError({ statusCode: 502, statusMessage: "Google Places failed" });
  });
  return sendRedirect(event, uri, 302);
});
```

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: no errors. If `PlaceInfo`/`PlaceRef` are not found on the server, the base layer's `shared/types` is not being scanned: add `import type { PlaceInfo, PlaceRef } from "~~/layers/base/shared/types/place";` where they are used.

- [ ] **Step 7: Check against the running server**

Run `pnpm dev`, then:

```bash
# A Google place id to try with:
curl -s "localhost:3000/api/places/autocomplete?q=Cafe%20Condesa%20Antigua&session=plancheck01" | head -c 300
# Full info (replace ID):
curl -s "localhost:3000/api/places/details?source=google&id=ID" | jq '{name, rating, openNow, photos: (.photos|length), reviews: (.reviews|length), fromGoogle}'
# Photo redirect, must be 302 with a Location header:
curl -sI "localhost:3000/api/places/photo?name=$(curl -s "localhost:3000/api/places/details?source=google&id=ID" | jq -r '.photos[0].name')&w=400" | grep -iE "^HTTP|^location"
# Validation: both must be 400
curl -s -o /dev/null -w "%{http_code}\n" "localhost:3000/api/places/details?source=recommended&id=not-a-uuid"
curl -s -o /dev/null -w "%{http_code}\n" "localhost:3000/api/places/photo?name=../../etc"
# Unknown recommended place: 404
curl -s -o /dev/null -w "%{http_code}\n" "localhost:3000/api/places/details?source=recommended&id=00000000-0000-4000-8000-000000000000"
```

Expected: details with a name, `fromGoogle: true`, photos and reviews counts > 0 for a busy place; `302` with a `location: https://…googleusercontent.com/…`; `400`, `400`, `404`. If you have a recommended place without `googlePlaceId` (see `/admin/places`), its details must come back with `fromGoogle: false` and empty `photos`/`reviews`.

- [ ] **Step 8: Commit**

```bash
git add layers/base/shared/types/place.ts layers/events/server
git commit -m "feat: place details and photos endpoints for the place panel"
```

---

### Task 2: Shared place panel and composables

**Files:**
- Create: `layers/base/app/composables/useIsDesktop.ts`
- Create: `layers/base/app/composables/useSelectedPlace.ts`
- Create: `layers/base/shared/utils/place-links.ts`
- Create: `layers/base/app/components/PlacePanel.vue`

**Interfaces:**
- Consumes: `PlaceRef`, `PlaceInfo`, `GET /api/places/details`, `GET /api/places/photo` (Task 1).
- Produces:
  - `useIsDesktop(): Ref<boolean>` — true at ≥1024px, false during SSR.
  - `useSelectedPlace(allowed: MaybeRefOrGetter<PlaceRef[]>): { selected: ComputedRef<PlaceRef | null>; open(place: PlaceRef): Promise<unknown>; close(): Promise<unknown> }`.
  - `instagramUrl(handle: string): string`, `whatsappUrl(phone: string): string`.
  - `<PlacePanel :place="PlaceRef" :fallback="{ name: string; address: string | null } | undefined" @close />` — use `:key` with the place id so switching places remounts it.

- [ ] **Step 1: `useIsDesktop`**

Create `layers/base/app/composables/useIsDesktop.ts`:

```ts
// Tailwind's lg breakpoint. False on the server and until mounted, so the
// mobile layout is what renders first.
export default function useIsDesktop() {
  const isDesktop = ref(false);

  onMounted(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => (isDesktop.value = query.matches);
    update();
    query.addEventListener("change", update);
    onBeforeUnmount(() => query.removeEventListener("change", update));
  });

  return isDesktop;
}
```

- [ ] **Step 2: `useSelectedPlace`**

Create `layers/base/app/composables/useSelectedPlace.ts`:

```ts
// The open place lives in ?place=<source>:<id> so a link can share it. Only
// the page's own places count: a crafted link to any other place is ignored.
export default function useSelectedPlace(allowed: MaybeRefOrGetter<PlaceRef[]>) {
  const route = useRoute();
  const router = useRouter();

  const selected = computed<PlaceRef | null>(() => {
    const value = route.query.place;
    if (typeof value !== "string") return null;
    const separator = value.indexOf(":");
    const source = value.slice(0, separator);
    const id = value.slice(separator + 1);
    return (
      toValue(allowed).find((place) => place.source === source && place.id === id) ?? null
    );
  });

  function open(place: PlaceRef) {
    const query = { ...route.query, place: `${place.source}:${place.id}` };
    // Switching places replaces the entry, so Back always closes the panel.
    return selected.value ? router.replace({ query }) : router.push({ query });
  }

  function close() {
    const { place: _place, ...query } = route.query;
    return router.replace({ query });
  }

  defineShortcuts({ escape: () => selected.value && close() });

  return { selected, open, close };
}
```

- [ ] **Step 3: Link helpers**

Create `layers/base/shared/utils/place-links.ts`:

```ts
export function instagramUrl(handle: string) {
  return handle.startsWith("http")
    ? handle
    : `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
```

- [ ] **Step 4: `PlacePanel.vue`**

Create `layers/base/app/components/PlacePanel.vue`:

```vue
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
            <UAvatar :src="review.authorPhoto ?? undefined" :alt="review.author" size="xs" />
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
```

- [ ] **Step 5: Typecheck, lint and a quick look**

Run: `pnpm typecheck && pnpm lint`
Expected: no errors. If `UCarousel`'s slot type rejects `item.name`, type the items: `:items="photos as PlaceInfo['photos']"`.

The panel has no page yet; Tasks 3 and 4 mount it. Its Review Focus checks (1 and 5) run there: in Task 3 step 6, block `/api/places/photo` in DevTools (Network → right click → Block request URL) and confirm the carousel disappears instead of showing broken images; then block `/api/places/details` and confirm the alert with the activity's name and "Abrir en Google Maps".

- [ ] **Step 6: Commit**

```bash
git add layers/base
git commit -m "feat: shared place panel with photos, hours, reviews and contact"
```

---

### Task 3: Trip page — two columns, map pins and bottom sheet

**Files:**
- Modify: `layers/trips/app/components/ItineraryPlaces.vue`
- Modify: `layers/trips/app/pages/trips/[id].vue`

**Interfaces:**
- Consumes: `PlacePanel`, `useSelectedPlace`, `useIsDesktop`, `PlaceRef` (Task 2).
- Produces: `<ItineraryPlaces :activities :selected-id="string | null" @select="(placeId: string) => …" />`.

- [ ] **Step 1: Selectable pins in `ItineraryPlaces.vue`**

Replace the `<script setup>` block with:

```ts
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
```

The template stays as it is.

- [ ] **Step 2: Selection state in `trips/[id].vue`**

In the `<script setup>` of `layers/trips/app/pages/trips/[id].vue`, after `const { createTripAndNavigate } = useTrips();`, add:

```ts
const tripActivities = computed(
  () => trip.value?.itinerary.flatMap((day) => day.activities) ?? []
);
const tripPlaces = computed<PlaceRef[]>(() =>
  tripActivities.value.flatMap((activity) =>
    activity.placeId ? [{ source: "google" as const, id: activity.placeId }] : []
  )
);
const { selected, open, close } = useSelectedPlace(tripPlaces);
const isDesktop = useIsDesktop();

// The activity's place name, shown while the panel loads or if Google fails.
const selectedFallback = computed(() => {
  const activity = tripActivities.value.find(
    (item) => item.placeId === selected.value?.id
  );
  return activity ? { name: activity.location || activity.name, address: null } : undefined;
});
```

And change `toTimelineItems` to carry the place id:

```ts
function toTimelineItems(activities: Activity[]): TimelineItem[] {
  return activities.map((activity) => ({
    date: activity.time,
    title: activity.name,
    description: activity.notes,
    icon: getActivityIcon(activity.activityType),
    placeId: activity.placeId,
  }));
}
```

`shareTrip` and `copyLink` already share `window.location.href`, which now includes `?place=` when a place is open. No change there.

- [ ] **Step 3: Layout in `trips/[id].vue`**

In the template:

1. Change the root `<div class="container mx-auto max-w-4xl px-4 py-8">` to `<div class="container mx-auto max-w-6xl px-4 py-8">`.
2. Replace everything from `<ItineraryPlaces :activities="trip.activitiesWithPlaces" class="mb-8" />` down to the closing `</UCard>` of the Itinerary card with:

```vue
      <div class="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start">
        <UCard class="min-w-0">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="size-5 text-primary" />
              <h2 class="text-lg font-semibold">Itinerary</h2>
            </div>
          </template>

          <div class="space-y-8">
            <section v-for="day in trip.itinerary" :key="day.day">
              <div class="mb-4 flex items-center gap-3">
                <div
                  class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-mango-950"
                >
                  {{ day.day }}
                </div>
                <h3 class="text-lg font-semibold text-highlighted">
                  Day {{ day.day }}
                </h3>
              </div>

              <UTimeline
                :items="toTimelineItems(day.activities)"
                size="sm"
                color="primary"
                class="ml-4"
              >
                <template #title="{ item }">
                  <button
                    v-if="item.placeId"
                    type="button"
                    class="cursor-pointer text-left underline-offset-4 hover:underline focus-visible:underline"
                    :class="{ 'text-primary': item.placeId === selected?.id }"
                    @click="open({ source: 'google', id: item.placeId })"
                  >
                    {{ item.title }}
                  </button>
                  <span v-else>{{ item.title }}</span>
                </template>
              </UTimeline>
            </section>
          </div>
        </UCard>

        <!-- First on mobile so the map stays above the itinerary, as before. -->
        <aside
          class="order-first space-y-4 lg:sticky lg:top-4 lg:order-none lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
        >
          <ItineraryPlaces
            :activities="trip.activitiesWithPlaces"
            :selected-id="selected?.id ?? null"
            @select="(placeId) => open({ source: 'google', id: placeId })"
          />
          <UCard v-if="isDesktop && selected">
            <PlacePanel
              :key="selected.id"
              :place="selected"
              :fallback="selectedFallback"
              @close="close"
            />
          </UCard>
        </aside>
      </div>

      <UDrawer
        :open="!isDesktop && !!selected"
        @update:open="(value) => { if (!value) close(); }"
      >
        <template #content>
          <div class="max-h-[85vh] overflow-y-auto p-4">
            <PlacePanel
              v-if="selected"
              :key="selected.id"
              :place="selected"
              :fallback="selectedFallback"
              @close="close"
            />
          </div>
        </template>
      </UDrawer>
```

The share/duplicate buttons block after it stays as is.

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: no errors. If `item.placeId` is not typed on `TimelineItem`, type the slot with `v-slot:title="{ item }: { item: TimelineItem & { placeId?: string } }"` or import and use an `ActivityTimelineItem` type alias in the script.

- [ ] **Step 5: Check desktop**

`pnpm dev`, sign in, open a trip (generate one at `/trips` if you have none). At ≥1024px wide:
- Itinerary on the left, map on the right; scrolling the itinerary keeps the map in view.
- Click an activity title with a place → panel under the map with photos, rating, open/closed, hours, contact, reviews and "Google Maps"; the pin grows and darkens and the map pans to it; URL has `?place=google:…`.
- Click a pin → same place opens. Click another activity → the panel switches without closing.
- ✕ and Esc close the panel and remove `?place=`.
- Activities without a place (travel legs) are plain text.

- [ ] **Step 6: Check mobile and the Review Focus cases**

In DevTools device mode (iPhone 14):
- The map sits above the itinerary as before. Tapping an activity opens the bottom sheet; swiping it down closes it.
- Open a place, then another, then press the browser Back once: the sheet closes and you are still on the trip.
- Copy the URL with `?place=` into a new tab: the sheet (or the desktop panel) opens with that place.
- Change the id in `?place=google:<id>` to a random string and reload: nothing opens, and the Network tab shows no `/api/places/details` request.
- Block `/api/places/details` (DevTools → Network → right click → Block request URL), open a place: the alert shows the activity's name and "Abrir en Google Maps". Unblock it.
- Block `/api/places/photo`, open a place not opened before in this tab: no broken images, no carousel. Unblock it.

- [ ] **Step 7: Commit**

```bash
git add layers/trips/app
git commit -m "feat: open trip places in a side panel or bottom sheet"
```

---

### Task 4: Event page — proposal places open the panel

**Files:**
- Modify: `layers/events/app/components/ProposalSteps.vue`
- Modify: `layers/events/app/pages/e/[slug].vue`

**Interfaces:**
- Consumes: `PlacePanel`, `useSelectedPlace`, `useIsDesktop`, `PlaceRef`, `instagramUrl` (Task 2).
- Produces: `<ProposalSteps :steps :selected="PlaceRef | null" @select="(place: PlaceRef) => …" />`.

- [ ] **Step 1: `ProposalSteps.vue` emits instead of linking out**

In the script, delete the local `instagramUrl` function (it now comes from `layers/base/shared/utils/place-links.ts`) and replace `defineProps` with:

```ts
defineProps<{
  steps: StoredProposalStep[];
  selected?: PlaceRef | null;
}>();
defineEmits<{ select: [place: PlaceRef] }>();
```

In the template, replace the `<ULink :to="step.place.mapsUrl" …>…</ULink>` with:

```vue
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-1 text-left font-semibold text-highlighted underline-offset-4 hover:underline focus-visible:underline"
              :class="{
                'text-primary':
                  selected?.source === step.place.source && selected?.id === step.place.id,
              }"
              @click="$emit('select', { source: step.place.source, id: step.place.id })"
            >
              <UIcon name="i-lucide-map-pin" class="shrink-0 text-primary" />
              {{ step.place.name }}
            </button>
```

- [ ] **Step 2: Selection state in `e/[slug].vue`**

In the `<script setup>`, after `const winner = computed(…)`, add:

```ts
const proposalPlaces = computed(() =>
  (event.value?.proposals ?? [])
    .flatMap((proposal) => proposal.steps)
    .flatMap((step) => (typeof step !== "string" && step.place ? [step.place] : []))
);
const { selected, open, close } = useSelectedPlace(() =>
  proposalPlaces.value.map((place) => ({ source: place.source, id: place.id }))
);
const isDesktop = useIsDesktop();

// The step's place as stored, shown while the panel loads or if it fails.
const selectedFallback = computed(() => {
  const place = proposalPlaces.value.find(
    (item) => item.source === selected.value?.source && item.id === selected.value?.id
  );
  return place ? { name: place.name, address: place.address } : undefined;
});
```

The "Compartir en WhatsApp" and "Copiar link" buttons keep sharing the event (`/e/<slug>`), not the open place; the address bar URL already carries `?place=` for anyone who wants to share a place.

- [ ] **Step 3: Layout in `e/[slug].vue`**

1. Change `<UContainer v-if="event" class="max-w-xl py-10 space-y-8">` to:

```vue
  <UContainer v-if="event" class="max-w-6xl py-10">
    <div
      class="grid gap-8 lg:items-start"
      :class="proposalPlaces.length ? 'lg:grid-cols-[2fr_3fr]' : 'mx-auto max-w-xl'"
    >
      <div class="min-w-0 space-y-8">
```

   With no places yet (event still open), the page keeps its single centered column.

2. Pass the selection to both `ProposalSteps`:

```vue
      <ProposalSteps
        :steps="winner.steps"
        :selected="selected"
        class="mt-4"
        @select="open"
      />
```

```vue
        <ProposalSteps
          :steps="proposal.steps"
          :selected="selected"
          class="mt-3"
          @select="open"
        />
```

3. Just before `</UContainer>` (after `<LoginPrompt … />`), close the left column and add the right column and the drawer:

```vue
      </div>

      <aside
        v-if="proposalPlaces.length"
        class="hidden lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
      >
        <UCard v-if="isDesktop && selected">
          <PlacePanel
            :key="`${selected.source}-${selected.id}`"
            :place="selected"
            :fallback="selectedFallback"
            @close="close"
          />
        </UCard>
        <UEmpty
          v-else
          icon="i-lucide-map-pin"
          title="Toca un lugar para ver fotos y detalles"
        />
      </aside>
    </div>

    <UDrawer
      :open="!isDesktop && !!selected"
      @update:open="(value) => { if (!value) close(); }"
    >
      <template #content>
        <div class="max-h-[85vh] overflow-y-auto p-4">
          <PlacePanel
            v-if="selected"
            :key="`${selected.source}-${selected.id}`"
            :place="selected"
            :fallback="selectedFallback"
            @close="close"
          />
        </div>
      </template>
    </UDrawer>
```

`LoginPrompt` stays inside the left column; it is a modal, so where it sits does not change the layout.

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: no errors.

- [ ] **Step 5: Check desktop, mobile and the Review Focus cases**

`pnpm dev`, open an event in voting or closed state (create one at `/e/new`, join, and generate proposals if needed):
- Desktop: left column as before; right column says "Toca un lugar para ver fotos y detalles". Clicking a step's place opens the panel with `?place=google:…` or `?place=recommended:<uuid>`; the clicked name turns primary.
- A recommended place with `googlePlaceId` (set it in `/admin/places`) shows our description, badge and Instagram plus Google photos, hours and reviews. One without it shows only our data and no "Google Maps" text.
- Deactivate that recommended place in `/admin/places` and reopen it: the alert with its stored name and "Abrir en Google Maps".
- An event with no proposals yet keeps the single narrow column.
- Mobile (DevTools device mode): tapping a place opens the sheet; Back closes it.
- A link with `?place=recommended:00000000-0000-4000-8000-000000000000` opens nothing and makes no `/api/places/details` request.
- Signed out (private window), the event page and its panel still work.

- [ ] **Step 6: Commit**

```bash
git add layers/events/app
git commit -m "feat: open event proposal places in the place panel"
```

---

### Task 5: Whole-branch check

**Files:** none new.

- [ ] **Step 1: Clean build checks**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: all three succeed.

- [ ] **Step 2: Cross-page pass**

On the dev server, in one browser session: open a trip place, then an event place, then go back to the trip with the browser Back button. Each page shows only its own panel, and the panel content matches the `?place=` in the URL.

- [ ] **Step 3: Owner action (not code)**

Remind the owner to set the daily quota caps in Google Cloud Console → APIs & Services → Places API (New) → Quotas, for Place Details and Place Photos requests per day.
