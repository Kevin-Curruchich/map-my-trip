<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import {
  eventBudgetOptions,
  eventBudgetValues,
} from "~~/layers/events/shared/constants/event-options.constant";
import { OWNER_TOKEN_HEADER } from "~~/layers/events/shared/constants/event-owner.constant";

const route = useRoute();
const slug = route.params.slug as string;

// Both live in this browser only, so they are read after mount and the page
// refetches with them to learn this person's vote and whether they created it.
const { getParticipantId, markJoined } = useJoinedEvents();
const { getOwnerToken } = useEventOwner();
const participantId = ref<string | null>(null);
const ownerToken = ref<string | null>(null);

const { data: event, error, refresh } = await useFetch(`/api/events/${slug}`, {
  query: computed(() =>
    participantId.value ? { participant: participantId.value } : {}
  ),
  headers: computed((): Record<string, string> =>
    ownerToken.value ? { [OWNER_TOKEN_HEADER]: ownerToken.value } : {}
  ),
});

const eventSummary = computed(() => {
  const when = event.value?.date ? `, ${formatEventDate(event.value.date)}` : "";
  return `Plan en ${event.value?.city}${when}. Únete y di qué quieres hacer y cuánto puedes gastar.`;
});

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
  description: () => eventSummary.value,
  ogDescription: () => eventSummary.value,
});

defineOgImage("Event", { slug });

// Keeps joins and votes from the rest of the group showing up live.
let pollTimer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  participantId.value = getParticipantId(slug);
  ownerToken.value = getOwnerToken(slug);
  pollTimer = setInterval(() => {
    if (!document.hidden && event.value?.status !== "closed") refresh();
  }, 5000);
});
onBeforeUnmount(() => clearInterval(pollTimer));

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

const ownerHeaders = computed((): Record<string, string> =>
  ownerToken.value ? { [OWNER_TOKEN_HEADER]: ownerToken.value } : {}
);

const isGenerating = ref(false);
async function generateProposals() {
  isGenerating.value = true;
  try {
    await $fetch(`/api/events/${slug}/proposals`, {
      method: "POST",
      headers: ownerHeaders.value,
    });
    await refresh();
  } catch (generateError) {
    console.error("Error generating proposals:", generateError);
    toast.add({
      title: "No pudimos proponer planes",
      description: "Inténtalo de nuevo en un momento.",
      color: "error",
    });
  } finally {
    isGenerating.value = false;
  }
}

const votingFor = ref<string | null>(null);
async function vote(proposalId: string) {
  if (!participantId.value) return;
  votingFor.value = proposalId;
  try {
    await $fetch(`/api/events/${slug}/votes`, {
      method: "POST",
      body: { participantId: participantId.value, proposalId },
    });
    await refresh();
  } catch (voteError) {
    console.error("Error voting:", voteError);
    toast.add({ title: "No pudimos guardar tu voto", color: "error" });
  } finally {
    votingFor.value = null;
  }
}

const isClosing = ref(false);
async function closeVoting() {
  isClosing.value = true;
  try {
    await $fetch(`/api/events/${slug}/close`, {
      method: "POST",
      headers: ownerHeaders.value,
      body: {},
    });
    await refresh();
  } catch (closeError) {
    console.error("Error closing vote:", closeError);
    toast.add({ title: "No pudimos cerrar la votación", color: "error" });
  } finally {
    isClosing.value = false;
  }
}

const totalVotes = computed(
  () => event.value?.proposals.reduce((sum, p) => sum + p.votes, 0) ?? 0
);
const winner = computed(() =>
  event.value?.proposals.find((p) => p.id === event.value?.winningProposalId)
);

function voteLabel(votes: number) {
  return votes === 1 ? "1 voto" : `${votes} votos`;
}

function budgetLabel(value: string) {
  return eventBudgetOptions.find((option) => option.value === value)?.label;
}

const requestOrigin = useRequestURL().origin;
// Same value on the server and in the browser, so the rendered wa.me link
// already carries it (behind Cloud Run the origin comes from x-forwarded-*).
const shareUrl = computed(() => `${requestOrigin}/e/${slug}`);
// No emoji: WhatsApp on iOS can turn emoji passed through wa.me into "�".
const shareText = computed(() =>
  event.value?.status === "voting"
    ? `${event.value?.title}: ya hay planes, entra a votar`
    : event.value?.status === "closed" && winner.value
      ? `${event.value?.title}: ganó ${winner.value.title}`
      : `${event.value?.title}: únete y di qué quieres hacer`
);
const whatsappUrl = computed(
  () =>
    `https://wa.me/?text=${encodeURIComponent(`${shareText.value} ${shareUrl.value}`)}`
);

// On phones the native share sheet passes the text untouched and lets people
// pick the WhatsApp group directly; desktops keep the wa.me link.
async function shareOnWhatsApp(clickEvent: MouseEvent) {
  if (!navigator.share || !matchMedia("(pointer: coarse)").matches) return;

  clickEvent.preventDefault();
  try {
    await navigator.share({ text: shareText.value, url: shareUrl.value });
  } catch (shareError) {
    if ((shareError as DOMException).name !== "AbortError") {
      window.open(whatsappUrl.value, "_blank");
    }
  }
}

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
      <div class="text-muted flex flex-col gap-1 mt-1">
        <ULink
          :to="eventMapUrl(event)"
          target="_blank"
          class="inline-flex items-center gap-1"
        >
          <UIcon name="i-lucide-map-pin" />
          {{ event.city }}
        </ULink>
        <span v-if="event.date" class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-calendar" />
          {{ formatEventDate(event.date) }}
        </span>
      </div>
      <p v-if="event.description" class="mt-2">{{ event.description }}</p>

      <div class="flex flex-wrap gap-2 mt-4">
        <UButton
          :to="whatsappUrl"
          target="_blank"
          icon="i-simple-icons-whatsapp"
          color="success"
          @click="shareOnWhatsApp"
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

    <UCard
      v-if="winner"
      class="ring-2 ring-primary"
    >
      <template #header>
        <p class="text-sm font-medium text-primary">Plan final</p>
        <h2 class="text-xl font-bold">{{ winner.title }}</h2>
      </template>
      <p>{{ winner.description }}</p>
      <ol class="mt-3 list-decimal space-y-1 pl-5">
        <li v-for="step in winner.steps" :key="step">{{ step }}</li>
      </ol>
      <template #footer>
        <p class="text-sm text-muted">
          {{ voteLabel(winner.votes) }} de {{ totalVotes }} ·
          {{ budgetLabel(winner.budget) }}
        </p>
      </template>
    </UCard>

    <section v-if="event.status === 'voting'" class="space-y-3">
      <div>
        <h2 class="font-semibold">Voten por un plan</h2>
        <p class="text-sm text-muted">
          {{
            participantId
              ? "Toca el que prefieras; puedes cambiar tu voto."
              : "Únete abajo para poder votar."
          }}
        </p>
      </div>

      <UCard
        v-for="proposal in event.proposals"
        :key="proposal.id"
        :class="{ 'ring-2 ring-primary': proposal.id === event.myVoteProposalId }"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-semibold">{{ proposal.title }}</h3>
          <UBadge variant="subtle" size="sm" class="shrink-0">
            {{ budgetLabel(proposal.budget) }}
          </UBadge>
        </div>
        <p class="mt-1 text-sm">{{ proposal.description }}</p>
        <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li v-for="step in proposal.steps" :key="step">{{ step }}</li>
        </ol>

        <div class="mt-4 flex items-center justify-between gap-3">
          <span class="text-sm text-muted">{{ voteLabel(proposal.votes) }}</span>
          <UButton
            v-if="participantId"
            size="sm"
            :variant="proposal.id === event.myVoteProposalId ? 'solid' : 'outline'"
            :icon="proposal.id === event.myVoteProposalId ? 'i-lucide-check' : 'i-lucide-thumbs-up'"
            :loading="votingFor === proposal.id"
            @click="vote(proposal.id)"
          >
            {{ proposal.id === event.myVoteProposalId ? "Tu voto" : "Votar" }}
          </UButton>
        </div>
      </UCard>
    </section>

    <UCard v-if="event.isOwner && event.status !== 'closed'">
      <template #header>
        <h2 class="font-semibold">Eres quien creó este plan</h2>
      </template>
      <p v-if="event.status === 'open'" class="text-sm text-muted">
        Cuando se haya unido el grupo, la IA propone 3 planes con lo que dijo
        cada quien y todos votan.
      </p>
      <p v-else class="text-sm text-muted">
        Llevan {{ voteLabel(totalVotes) }} de {{ event.participants.length }}
        personas. Al cerrar, gana el plan con más votos.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <UButton
          v-if="event.status === 'voting'"
          icon="i-lucide-flag"
          :loading="isClosing"
          :disabled="isGenerating"
          @click="closeVoting"
        >
          Cerrar votación
        </UButton>
        <UButton
          icon="i-lucide-sparkles"
          :variant="event.status === 'voting' ? 'outline' : 'solid'"
          :loading="isGenerating"
          :disabled="event.participants.length === 0 || isClosing"
          @click="generateProposals"
        >
          {{
            event.status === "voting"
              ? "Proponer otros planes"
              : "Proponer planes con IA"
          }}
        </UButton>
      </div>
      <p
        v-if="event.status === 'voting'"
        class="mt-2 text-xs text-dimmed"
      >
        Proponer otros planes borra los votos actuales.
      </p>
      <p
        v-else-if="event.participants.length === 0"
        class="mt-2 text-xs text-dimmed"
      >
        Necesitas al menos una persona unida.
      </p>
    </UCard>

    <UCard v-if="!participantId && event.status !== 'closed'">
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
      v-else-if="participantId && event.status === 'open'"
      icon="i-lucide-check"
      color="success"
      variant="subtle"
      title="Ya estás dentro"
      description="Cuando el grupo esté completo, quien creó el plan pedirá 3 propuestas y aquí mismo votan."
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
          v-for="(participant, index) in event.participants"
          :key="index"
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
