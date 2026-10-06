<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import {
  eventBudgetOptions,
  eventBudgetValues,
} from "~~/layers/events/shared/constants/event-options.constant";

const route = useRoute();
const slug = route.params.slug as string;

const { data: event, error, refresh } = await useFetch(`/api/events/${slug}`);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: "Evento no encontrado",
    fatal: true,
  });
}

useSeoMeta({
  title: () => event.value?.title,
  ogTitle: () => event.value?.title,
  description: () =>
    `Plan en ${event.value?.city}. Únete y di qué quieres hacer y cuánto puedes gastar.`,
  ogDescription: () =>
    `Plan en ${event.value?.city}. Únete y di qué quieres hacer y cuánto puedes gastar.`,
});

const { getParticipantId, markJoined } = useJoinedEvents();
const participantId = ref<string | null>(null);
onMounted(() => {
  participantId.value = getParticipantId(slug);
});

const schema = z.object({
  name: z.string().trim().min(1, "¿Cómo te llamas?").max(40),
  budget: z.enum(eventBudgetValues, { message: "Elige un presupuesto" }),
  preferences: z.string().trim().max(300).optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  budget: undefined,
  preferences: "",
});
const isJoining = ref(false);
const toast = useToast();

async function onSubmit(submitEvent: FormSubmitEvent<Schema>) {
  isJoining.value = true;
  try {
    const { id } = await $fetch(`/api/events/${slug}/participants`, {
      method: "POST",
      body: submitEvent.data,
    });
    markJoined(slug, id);
    participantId.value = id;
    await refresh();
  } catch (joinError) {
    console.error("Error joining event:", joinError);
    toast.add({
      title: "No pudimos unirte al plan",
      description: "Inténtalo de nuevo en un momento.",
      color: "error",
    });
  } finally {
    isJoining.value = false;
  }
}

function budgetLabel(value: string) {
  return eventBudgetOptions.find((option) => option.value === value)?.label;
}

const shareUrl = computed(() =>
  import.meta.client ? window.location.href : ""
);
const whatsappUrl = computed(() => {
  const text = `${event.value?.title}: únete y di qué quieres hacer 👉 ${shareUrl.value}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
});

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    toast.add({ title: "Link copiado", color: "success" });
  } catch {
    toast.add({ title: "No se pudo copiar el link", color: "error" });
  }
}
</script>

<template>
  <UContainer v-if="event" class="max-w-xl py-10 space-y-8">
    <section>
      <h1 class="text-2xl font-bold">{{ event.title }}</h1>
      <p class="text-muted">
        {{ event.city }}<span v-if="event.date"> · {{ event.date }}</span>
      </p>
      <p v-if="event.description" class="mt-2">{{ event.description }}</p>

      <div class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="whatsappUrl"
          target="_blank"
          icon="i-simple-icons-whatsapp"
          color="success"
        >
          Compartir en WhatsApp
        </UButton>
        <UButton
          icon="i-lucide-link"
          variant="outline"
          color="neutral"
          @click="copyLink"
        >
          Copiar link
        </UButton>
      </div>
    </section>

    <UCard v-if="!participantId">
      <template #header>
        <h2 class="font-semibold">Únete al plan</h2>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Tu nombre" name="name" required>
          <UInput v-model="state.name" placeholder="Ana" class="w-full" />
        </UFormField>

        <UFormField label="¿Cuánto puedes gastar?" name="budget" required>
          <URadioGroup
            v-model="state.budget"
            orientation="horizontal"
            :items="
              eventBudgetOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))
            "
          />
        </UFormField>

        <UFormField label="¿Qué te gustaría hacer?" name="preferences">
          <UTextarea
            v-model="state.preferences"
            placeholder="Algo tranquilo, comida mexicana, nada muy lejos"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" block :loading="isJoining">Unirme</UButton>
      </UForm>
    </UCard>

    <UAlert
      v-else
      icon="i-lucide-check"
      color="success"
      variant="subtle"
      title="Ya estás dentro"
      description="Cuando todos se unan, les propondremos planes para votar."
    />

    <section>
      <h2 class="font-semibold mb-3">
        Se han unido {{ event.participants.length }}
      </h2>
      <p v-if="event.participants.length === 0" class="text-muted">
        Todavía nadie. Comparte el link en tu grupo.
      </p>
      <ul v-else class="space-y-2">
        <li
          v-for="participant in event.participants"
          :key="participant.id"
          class="flex items-start gap-3"
        >
          <UAvatar :alt="participant.name" size="sm" />
          <div>
            <p class="font-medium">
              {{ participant.name }}
              <UBadge variant="subtle" size="sm" class="ml-1">
                {{ budgetLabel(participant.budget) }}
              </UBadge>
            </p>
            <p v-if="participant.preferences" class="text-sm text-muted">
              {{ participant.preferences }}
            </p>
          </div>
        </li>
      </ul>
    </section>
  </UContainer>
</template>
