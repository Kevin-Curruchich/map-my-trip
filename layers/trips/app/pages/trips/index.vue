<script lang="ts" setup>
import {
  budgetOptions,
  durationOptions,
  styleOptions,
  travelerOptions,
  type TripOption,
} from "~~/layers/trips/shared/constants/trip-options.constant";

definePageMeta({
  middleware: "auth",
});

type FilterKey = "duration" | "travelers" | "style" | "budget";

const filterFields: {
  key: FilterKey;
  label: string;
  placeholder: string;
  options: TripOption<string | number>[];
}[] = [
  { key: "duration", label: "Duration", placeholder: "How long?", options: durationOptions },
  { key: "travelers", label: "Travelers", placeholder: "How many?", options: travelerOptions },
  { key: "style", label: "Style", placeholder: "What type?", options: styleOptions },
  { key: "budget", label: "Budget", placeholder: "Price range?", options: budgetOptions },
];

const input = ref("");
const isLoading = ref(false);
const showOptions = ref(false);
const filters = reactive<Partial<Record<FilterKey, string | number>>>({});
const textarea = useTemplateRef("textarea");

const toast = useToast();
const { tripsExamples } = useTripsExamples();
const { createTripAndNavigate } = useTrips();

const selectedFilters = computed(() =>
  filterFields.flatMap((field) => {
    const option = field.options.find((opt) => opt.value === filters[field.key]);
    return option ? [{ key: field.key, name: field.label, label: option.label }] : [];
  })
);

const placeholder = computed(() => {
  const labels = selectedFilters.value
    .filter((filter) => filter.key !== "budget")
    .map((filter) => filter.label.toLowerCase());

  return labels.length > 0 ? `Plan a ${labels.join(", ")} trip...` : "Ask MapMyTrip";
});

function clearFilter(key: FilterKey) {
  filters[key] = undefined;
}

function clearAllFilters() {
  filterFields.forEach((field) => clearFilter(field.key));
}

function buildPrompt() {
  const preferences = selectedFilters.value
    .map((filter) => `${filter.name}: ${filter.label}`)
    .join(", ");

  return preferences ? `${input.value.trim()}\n\nPreferences: ${preferences}` : input.value.trim();
}

async function handleSubmit() {
  if (!input.value.trim() || isLoading.value) return;

  isLoading.value = true;
  try {
    await createTripAndNavigate(buildPrompt());
    input.value = "";
    clearAllFilters();
  } catch (error) {
    console.error("Error creating trip:", error);
    toast.add({
      title: "We couldn't create your trip",
      description: "Please try again in a moment.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isLoading.value = false;
  }
}

async function selectExample(example: TripExample) {
  input.value = example.description;
  await nextTick();
  textarea.value?.textareaRef?.focus();
}
</script>

<template>
  <div class="relative">
    <main class="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 pb-48">
      <div class="mb-12 text-center">
        <h1 class="mb-3 text-3xl text-highlighted">Hello, Traveler</h1>
        <p class="mx-auto max-w-sm text-muted">
          Where would you like to explore next?
        </p>
      </div>

      <div v-if="tripsExamples.length" class="mx-auto w-full max-w-sm">
        <h2 class="mb-3 text-center text-sm font-medium text-dimmed">
          Recent ideas
        </h2>
        <div class="space-y-2">
          <UCard
            v-for="example in tripsExamples"
            :key="example.title"
            variant="subtle"
            class="cursor-pointer"
            @click="selectExample(example)"
          >
            <div class="mb-1 text-sm font-medium">{{ example.title }}</div>
            <div class="line-clamp-2 text-xs text-muted">
              {{ example.description }}
            </div>
          </UCard>
        </div>
      </div>
    </main>

    <div class="fixed inset-x-0 bottom-0 z-20 border-t border-default backdrop-blur-xl">
      <form class="mx-auto max-w-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" @submit.prevent="handleSubmit">
        <div v-if="selectedFilters.length" class="mb-3 flex flex-wrap gap-2 px-2">
          <UBadge
            v-for="filter in selectedFilters"
            :key="filter.key"
            variant="subtle"
            class="gap-1"
          >
            {{ filter.label }}
            <UButton
              type="button"
              icon="i-lucide-x"
              size="xs"
              variant="link"
              :aria-label="`Remove ${filter.name}`"
              class="p-0"
              @click="clearFilter(filter.key)"
            />
          </UBadge>
        </div>

        <UTextarea
          ref="textarea"
          v-model="input"
          :placeholder="placeholder"
          :rows="2"
          autoresize
          :disabled="isLoading"
          class="w-full"
          @keydown.meta.enter.prevent="handleSubmit"
          @keydown.ctrl.enter.prevent="handleSubmit"
        />

        <div class="my-3 flex justify-between">
          <UButton
            type="button"
            variant="subtle"
            :icon="showOptions ? 'i-lucide-chevron-down' : 'i-lucide-sliders-vertical'"
            aria-label="Trip options"
            @click="showOptions = !showOptions"
          />
          <UButton
            type="submit"
            :disabled="!input.trim()"
            :loading="isLoading"
            icon="i-lucide-arrow-up"
            aria-label="Create trip"
          />
        </div>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          leave-active-class="transition-all duration-200 ease-in"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showOptions" class="my-4 rounded-lg border border-default p-4">
            <div class="mb-4 grid grid-cols-2 gap-3">
              <UFormField
                v-for="field in filterFields"
                :key="field.key"
                :label="field.label"
                size="xs"
              >
                <USelect
                  v-model="filters[field.key]"
                  :items="field.options"
                  :placeholder="field.placeholder"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="text-center">
              <UButton
                type="button"
                variant="link"
                color="neutral"
                size="xs"
                :disabled="!selectedFilters.length"
                @click="clearAllFilters"
              >
                Clear all
              </UButton>
            </div>
          </div>
        </Transition>
      </form>
    </div>
  </div>
</template>
