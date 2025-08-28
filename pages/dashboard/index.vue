<script setup lang="ts">
import { useTripPlannerStore } from "~/store/useTripPlannerStore";

definePageMeta({
  layout: "authenticated",
});

const { t, locale } = useI18n();
const tripStore = useTripPlannerStore();

const userInput = ref("");

const selectPrompt = (promptText: string) => {
  userInput.value = promptText;
};

const sendMessage = async () => {
  if (!userInput.value.trim() || tripStore.isGenerating) return;

  const currentInput = userInput.value;
  userInput.value = "";

  try {
    await tripStore.generateTripPlan(currentInput);

    // Navigate to preview page
    await navigateTo("/dashboard/trip-preview");
  } catch (error) {
    console.error("Error creating trip plan:", error);
  }
};

const generatePromptIdeas = async () => {
  try {
    const language = locale.value || "en";

    await tripStore.generatePromptIdeas(language);
  } catch (error) {
    console.error("Error fetching prompt ideas:", error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 md:p-6 px-3 py-4">
    <div class="max-w-4xl mx-auto" v-show="!tripStore.isGenerating">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ t("planPerfectTrip") }}
        </h1>
        <p class="text-gray-600">
          {{ t("describeDreamTrip") }}
        </p>
      </div>

      <div class="bg-white rounded-lg p-2 md:p-3">
        <div class="flex gap-1 md:gap-2">
          <UTextarea
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            :rows="2"
            autoresize
            :placeholder="t('describeTripPlaceholder')"
            class="flex-1 rounded-lg"
          />
          <UButton
            @click="sendMessage"
            :disabled="!userInput.trim() || tripStore.isGenerating"
            :loading="tripStore.isGenerating"
            class="text-white rounded font-medium transition-colors max-h-[50px]"
            icon="i-heroicons-paper-airplane"
          >
          </UButton>
        </div>
      </div>
      <div class="mt-2 py-1 px-2">
        <span class="text-xs md:text-sm font-medium text-gray-800 mb-4">
          {{ t("needInspiration") }}
        </span>

        <UButton
          v-if="tripStore.examplePrompts.length === 0"
          @click="generatePromptIdeas"
          variant="ghost"
          size="sm"
          icon="i-heroicons-light-bulb"
          :loading="tripStore.isGeneratingIdeas"
        />

        <magic-marquee
          v-if="tripStore.examplePrompts.length > 0"
          id="magic-marquee-prompts"
          class="flex gap-4 overflow-x-auto bg-surface-elevation-base text-surface py-6 rounded-surface-sm"
        >
          <!-- @mouseover="pause"
          @mouseleave="play" -->
          <div
            v-for="prompt in tripStore.examplePrompts"
            :key="prompt.id"
            @click="selectPrompt(prompt.text)"
            class="bg-white rounded-lg py-1 px-3 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors min-w-64"
          >
            <div class="flex items-center mb-2">
              <span class="text-sm md:text-l mr-2">{{ prompt.icon }}</span>
              <span class="text-sm md:text-l font-medium text-gray-800">
                {{ prompt.title }}
              </span>
            </div>
            <p class="text-xs md:text-sm text-gray-600">{{ prompt.text }}</p>
          </div>
        </magic-marquee>
      </div>
      <div class="mt-2 border-t">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">
            My last trips
          </h3>
          <UButton
            to="/dashboard/trips"
            color="primary"
            class="mt-2"
            variant="link"
          >
            View My Trips
          </UButton>
        </div>
      </div>
    </div>
    <div
      v-show="tripStore.isGenerating"
      class="flex flex-col items-center justify-center min-h-screen bg-gray-50"
    >
      <USkeleton
        class="w-64 h-14 border border-primary-500 shadow-sm"
        animation="bounce"
      >
        <div class="flex items-center justify-center h-full text-xl font-bold">
          Map My Trip
        </div>
      </USkeleton>
      <div class="text-center mt-4">
        <p class="text-gray-600">{{ t("generatingTripPlan") }}</p>
        <p class="text-gray-500 text-sm">
          {{ t("thisMayTakeAWhile") }}
        </p>
      </div>
    </div>
  </div>
</template>
