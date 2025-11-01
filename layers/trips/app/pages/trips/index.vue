<script lang="ts" setup>
import {
  budgetOptions,
  durationOptions,
  styleOptions,
  travelerOptions,
} from "~~/layers/trips/shared/constants/trip-options.constant";

definePageMeta({
  middleware: "auth",
});

const input = ref("");
const isLoading = ref(false);
const showOptions = ref(false);

// Trip configuration options
const tripDuration = ref<number | undefined>(undefined);
const numberOfTravelers = ref<number | undefined>(undefined);
const travelStyle = ref<string | undefined>(undefined);
const budget = ref<string | undefined>(undefined);

const { tripsExamples, fetchTripsExamples } = useTripsExamples();
const { createTripAndNavigate } = useTrips();

function handleClearInputs() {
  input.value = "";
  tripDuration.value = undefined;
  numberOfTravelers.value = undefined;
  travelStyle.value = undefined;
  budget.value = undefined;
}

// Functions
async function handleSubmit(event: Event) {
  event.preventDefault();

  if (!input.value.trim()) return;

  isLoading.value = true;

  try {
    await createTripAndNavigate(input.value);

    // Reset form
    handleClearInputs();
  } catch (error) {
    console.error("Error creating trip:", error);
  } finally {
    isLoading.value = false;
  }
}

async function selectExample(example: TripExample) {
  input.value = example.description;
  // Focus the input after selection
  nextTick(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  });
}

const dynamicPlaceholder = computed(() => {
  const selections = [];

  if (travelStyle.value) {
    const style = styleOptions.find(
      (opt) => opt.value === travelStyle.value
    )?.label;
    selections.push(style?.toLowerCase());
  }

  if (numberOfTravelers.value) {
    const travelers = travelerOptions
      .find((opt) => opt.value === numberOfTravelers.value)
      ?.label.toLowerCase();
    selections.push(travelers);
  }

  if (tripDuration.value) {
    const duration = durationOptions
      .find((opt) => opt.value === tripDuration.value)
      ?.label.toLowerCase();
    selections.push(`for ${duration}`);
  }

  return selections.length > 0
    ? `Plan a ${selections.join(" ")}...`
    : "Ask MapMyTrip";
});

const hasAnySelection = computed(
  () =>
    tripDuration.value ||
    numberOfTravelers.value ||
    travelStyle.value ||
    budget.value
);

const selectedBadges = computed(() => {
  const badges = [];

  if (tripDuration.value) {
    badges.push({
      key: "duration",
      label:
        durationOptions.find((opt) => opt.value === tripDuration.value)
          ?.label || "",
    });
  }

  if (numberOfTravelers.value) {
    badges.push({
      key: "travelers",
      label:
        travelerOptions.find((opt) => opt.value === numberOfTravelers.value)
          ?.label || "",
    });
  }

  if (travelStyle.value) {
    badges.push({
      key: "style",
      label:
        styleOptions.find((opt) => opt.value === travelStyle.value)?.label ||
        "",
    });
  }

  if (budget.value) {
    badges.push({
      key: "budget",
      label:
        budgetOptions.find((opt) => opt.value === budget.value)?.label || "",
    });
  }

  return badges;
});

function clearSelection(key: string) {
  switch (key) {
    case "duration":
      tripDuration.value = undefined;
      break;
    case "travelers":
      numberOfTravelers.value = undefined;
      break;
    case "style":
      travelStyle.value = undefined;
      break;
    case "budget":
      budget.value = undefined;
      break;
  }
}

function clearAllSelections() {
  tripDuration.value = undefined;
  numberOfTravelers.value = undefined;
  travelStyle.value = undefined;
  budget.value = undefined;
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Submit with Ctrl/Cmd + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    handleSubmit(event);
  }
}

await Promise.all([fetchTripsExamples()]);
</script>

<template>
  <div class="min-h-screen text-white relative overflow-hidden">
    <!-- Main Content - Scrollable Area -->
    <main
      class="relative z-10 overflow-y-auto pb-40"
      style="height: calc(100vh - 100px)"
    >
      <!-- Greeting Section -->
      <div
        class="dark:text-gray-100 text-primary flex flex-col justify-center px-6 min-h-full"
      >
        <!-- Greeting -->
        <div class="text-center mb-12">
          <h1 class="text-3xl mb-3">Hello, Traveler</h1>
          <p class="max-w-sm mx-auto leading-relaxed">
            Where would you like to explore next?
          </p>
        </div>

        <!-- Trip Examples -->
        <div v-if="tripsExamples?.length" class="max-w-sm mx-auto">
          <h3 class="text-sm font-medium text-gray-400 mb-3 text-center">
            Recent ideas
          </h3>
          <div class="space-y-2">
            <UCard
              v-for="example in tripsExamples"
              :key="example.title"
              variant="subtle"
              @click="selectExample(example)"
            >
              <div class="text-sm font-medium mb-1">
                {{ example.title }}
              </div>
              <div class="text-xs text-gray-500 line-clamp-2">
                {{ example.description }}
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </main>

    <!-- Fixed Bottom Input Area -->
    <div
      class="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-xl border-t border-gray-800/50"
    >
      <div class="p-4 safe-area-inset-bottom">
        <form class="max-w-2xl mx-auto" @submit="handleSubmit">
          <!-- Selected options display -->
          <div v-if="hasAnySelection" class="flex flex-wrap gap-2 mb-3 px-2">
            <UBadge
              v-for="badge in selectedBadges"
              :key="badge.key"
              class="inline-flex items-center gap-1"
            >
              {{ badge.label }}
              <button
                class="ml-1 hover:bg-blue-500/30 rounded-full p-0.5"
                @click="clearSelection(badge.key)"
              >
                <UIcon name="i-heroicons-x-mark-16-solid" class="w-3 h-3" />
              </button>
            </UBadge>
          </div>

          <div class="flex flex-col">
            <!-- Input Container -->
            <div class="">
              <UTextarea
                v-model="input"
                :placeholder="dynamicPlaceholder"
                :rows="2"
                autoresize
                :disabled="isLoading"
                class="w-full placeholder:text-gray-400 resize-none"
                @keydown="handleKeyDown"
              />
            </div>
            <div class="my-3 flex justify-between">
              <!-- Options Toggle -->
              <UButton
                class="transition-all"
                variant="subtle"
                :icon="
                  showOptions
                    ? 'i-heroicons-chevron-down-16-solid'
                    : 'i-heroicons-adjustments-vertical-16-solid'
                "
                @click="showOptions = !showOptions"
              />

              <UButton
                type="submit"
                :disabled="!input.trim() || isLoading"
                :loading="isLoading"
                icon="i-heroicons-arrow-up-16-solid"
              />
            </div>
          </div>

          <!-- Collapsible Options -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="transform opacity-0 -translate-y-2"
            enter-to-class="transform opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="transform opacity-100 translate-y-0"
            leave-to-class="transform opacity-0 -translate-y-2"
          >
            <div
              v-if="showOptions"
              class="my-4 p-4 backdrop-blur-sm border border-gray-700/30 rounded-lg"
            >
              <div class="grid grid-cols-2 gap-3 mb-4">
                <!-- Duration -->
                <div>
                  <label class="block text-xs font-medium text-gray-400 mb-2">
                    Duration
                  </label>
                  <USelect
                    v-model="tripDuration"
                    :items="durationOptions"
                    placeholder="How long?"
                    value-attribute="value"
                    option-attribute="label"
                    class="w-full"
                  />
                </div>

                <!-- Travelers -->
                <div>
                  <label class="block text-xs font-medium text-gray-400 mb-2"
                    >Travelers</label
                  >
                  <USelect
                    v-model="numberOfTravelers"
                    :items="travelerOptions"
                    placeholder="How many?"
                    value-attribute="value"
                    option-attribute="label"
                    class="w-full"
                  />
                </div>

                <!-- Style -->
                <div>
                  <label class="block text-xs font-medium text-gray-400 mb-2"
                    >Style</label
                  >
                  <USelect
                    v-model="travelStyle"
                    :items="styleOptions"
                    placeholder="What type?"
                    value-attribute="value"
                    option-attribute="label"
                    class="w-full"
                  />
                </div>

                <!-- Budget -->
                <div>
                  <label class="block text-xs font-medium text-gray-400 mb-2"
                    >Budget</label
                  >
                  <USelect
                    v-model="budget"
                    :items="budgetOptions"
                    placeholder="Price range?"
                    value-attribute="value"
                    option-attribute="label"
                    class="w-full"
                  />
                </div>
              </div>

              <!-- Clear All -->
              <div class="text-center">
                <button
                  type="button"
                  class="text-xs text-gray-400 hover:text-gray-200 disabled:opacity-50"
                  :disabled="!hasAnySelection"
                  @click="clearAllSelections"
                >
                  Clear all
                </button>
              </div>
            </div>
          </Transition>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper safe area handling for mobile devices */
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Custom scrollbar styling for webkit browsers */
main::-webkit-scrollbar {
  width: 4px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

main::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Smooth scrolling behavior */
main {
  scroll-behavior: smooth;
}
</style>
