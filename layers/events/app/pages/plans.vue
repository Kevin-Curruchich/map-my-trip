<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

useSeoMeta({ title: "Mis planes" });

const { listJoinedSlugs } = useJoinedEvents();

// Joined plans are remembered in this browser, so the list loads client-side.
const { data, status } = await useFetch("/api/me/plans", {
  server: false,
  query: computed(() => ({ slugs: listJoinedSlugs().slice(0, 50).join(",") })),
});

const eventStatusLabels = {
  open: "Sumando gente",
  voting: "Votando",
  closed: "Plan decidido",
} as const;

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
});
</script>

<template>
  <UContainer class="max-w-2xl py-10 space-y-10">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold">Mis planes</h1>
      <UButton to="/e/new" icon="i-lucide-plus">Nuevo plan en grupo</UButton>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
    </div>

    <template v-else-if="data">
      <section>
        <h2 class="font-semibold mb-3">Planes en grupo</h2>
        <p v-if="data.events.length === 0" class="text-muted">
          Todavía no tienes planes en grupo.
        </p>
        <ul v-else class="space-y-2">
          <li v-for="event in data.events" :key="event.slug">
            <ULink
              :to="`/e/${event.slug}`"
              class="flex items-center justify-between gap-3 rounded-lg border border-default p-3 hover:bg-elevated"
            >
              <div>
                <p class="font-medium text-highlighted">{{ event.title }}</p>
                <p class="text-sm text-muted">
                  {{ event.city
                  }}<span v-if="event.date"> · {{ formatEventDate(event.date) }}</span>
                </p>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1">
                <UBadge variant="subtle" :color="event.isOwner ? 'primary' : 'neutral'">
                  {{ event.isOwner ? "Creado por ti" : "Te uniste" }}
                </UBadge>
                <span class="text-xs text-dimmed">{{ eventStatusLabels[event.status] }}</span>
              </div>
            </ULink>
          </li>
        </ul>
      </section>

      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Viajes</h2>
          <UButton to="/trips" variant="ghost" size="sm" icon="i-lucide-plus">
            Nuevo viaje
          </UButton>
        </div>
        <p v-if="data.trips.length === 0" class="text-muted">
          Todavía no tienes viajes guardados.
        </p>
        <ul v-else class="space-y-2">
          <li v-for="trip in data.trips" :key="trip.id">
            <ULink
              :to="`/trips/${trip.id}`"
              class="flex items-center justify-between gap-3 rounded-lg border border-default p-3 hover:bg-elevated"
            >
              <div>
                <p class="font-medium text-highlighted">{{ trip.title }}</p>
                <p class="text-sm text-muted">{{ trip.destination }}</p>
              </div>
              <span class="text-sm text-dimmed">
                {{ dateFormatter.format(new Date(trip.createdAt)) }}
              </span>
            </ULink>
          </li>
        </ul>
      </section>
    </template>

    <UAlert
      v-else
      color="error"
      variant="subtle"
      title="No pudimos cargar tus planes"
      description="Inténtalo de nuevo en un momento."
    />
  </UContainer>
</template>
