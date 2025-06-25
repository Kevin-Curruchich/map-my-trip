<script setup lang="ts">
definePageMeta({
  layout: "authenticated",
});

const { t } = useI18n();

const userInput = ref("");
const isLoading = ref(false);

const examplePrompts = [
  {
    id: "1",
    icon: "🏖️",
    title: computed(() => t("beachVacation")),
    text: computed(() => t("beachVacationText")),
  },
  {
    id: "2",
    icon: "🏔️",
    title: computed(() => t("mountainAdventure")),
    text: computed(() => t("mountainAdventureText")),
  },
  {
    id: "3",
    icon: "🏛️",
    title: computed(() => t("culturalTour")),
    text: computed(() => t("culturalTourText")),
  },
  {
    id: "4",
    icon: "🍷",
    title: computed(() => t("foodWine")),
    text: computed(() => t("foodWineText")),
  },
];

const selectPrompt = (promptText: ComputedRef<string>) => {
  userInput.value = promptText.value;
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  userInput.value = "";
  isLoading.value = true;

  try {
    // TODO: Replace with actual LLM API call
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
  } catch (error) {
    console.error("Error creating trip plan:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ t("planPerfectTrip") }}
        </h1>
        <p class="text-gray-600">
          {{ t("describeDreamTrip") }}
        </p>
      </div>

      <!-- Chat Interface -->
      <div class="bg-white rounded-lg p-2">
        <div class="flex gap-3">
          <UTextarea
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            autoresize
            :placeholder="t('describeTripPlaceholder')"
            class="flex-1 rounded-lg"
          />
          <UButton
            @click="sendMessage"
            :disabled="!userInput.trim() || isLoading"
            class="disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors max-h-[40px]"
          >
            <span v-if="isLoading">{{ t("creating") }}</span>
            <span v-else>{{ t("createPlan") }}</span>
          </UButton>
        </div>
      </div>
      <div class="mt-2 py-1 px-2">
        <span class="text-sm font-medium text-gray-800 mb-4">
          {{ t("needInspiration") }}
        </span>
        <magic-marquee
          id="magic-marquee-prompts"
          class="flex gap-4 overflow-x-auto bg-surface-elevation-base text-surface py-6 rounded-surface-sm"
        >
          <!-- @mouseover="pause"
          @mouseleave="play" -->
          <div
            v-for="prompt in examplePrompts"
            :key="prompt.id"
            @click="selectPrompt(prompt.text)"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors min-w-64"
          >
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-2">{{ prompt.icon }}</span>
              <span class="font-medium text-gray-800">
                {{ prompt.title }}
              </span>
            </div>
            <p class="text-sm text-gray-600">{{ prompt.text }}</p>
          </div>
        </magic-marquee>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
