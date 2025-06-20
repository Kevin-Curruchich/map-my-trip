<script setup lang="ts">
definePageMeta({
  layout: "authenticated",
});

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

interface PromptExample {
  id: string;
  icon: string;
  title: string;
  text: string;
}

const userInput = ref("");
const isLoading = ref(false);
const messages = ref<Message[]>([]);
const isHovered = ref(false);

const examplePrompts: PromptExample[] = [
  {
    id: "1",
    icon: "🏖️",
    title: "Beach Vacation",
    text: "Plan a 7-day beach vacation in Thailand with water activities and local cuisine",
  },
  {
    id: "2",
    icon: "🏔️",
    title: "Mountain Adventure",
    text: "Create a 5-day hiking trip in the Swiss Alps with scenic routes and cozy lodges",
  },
  {
    id: "3",
    icon: "🏛️",
    title: "Cultural Tour",
    text: "Design a 10-day cultural tour through Italy visiting museums, historic sites, and local markets",
  },
  {
    id: "4",
    icon: "🍷",
    title: "Food & Wine",
    text: "Plan a 4-day food and wine experience in Napa Valley with tastings and cooking classes",
  },
];

const selectPrompt = (promptText: string) => {
  userInput.value = promptText;
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    type: "user",
    content: userInput.value,
  };

  messages.value.push(userMessage);
  const currentInput = userInput.value;
  userInput.value = "";
  isLoading.value = true;

  try {
    // TODO: Replace with actual LLM API call
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: `I'll help you create a trip plan based on: "${currentInput}". Let me generate a detailed itinerary for you...`,
    };

    messages.value.push(assistantMessage);
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
          Plan Your Perfect Trip
        </h1>
        <p class="text-gray-600">
          Describe your dream trip and let AI create the perfect itinerary for
          you
        </p>
      </div>

      <!-- Chat Interface -->
      <div class="bg-white rounded-lg p-2">
        <div class="flex gap-3">
          <UTextarea
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            autosize
            :rows="2"
            :maxrows="4"
            placeholder="Describe your trip..."
            class="flex-1 rounded-lg resize-none"
          />
          <UButton
            @click="sendMessage"
            :disabled="!userInput.trim() || isLoading"
            class="disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            <span v-if="isLoading">Creating...</span>
            <span v-else>Create Plan</span>
          </UButton>
        </div>
      </div>
      <div class="mt-2 py-1 px-2">
        <span class="text-sm font-medium text-gray-800 mb-4">
          Need inspiration? Try these examples:
        </span>
        <div
          class="prompts-container"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <div class="prompts-track" :class="{ paused: isHovered }">
            <div
              v-for="prompt in examplePrompts"
              :key="prompt.id"
              @click="selectPrompt(prompt.text)"
              class="flex-shrink-0 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors min-w-64"
            >
              <div class="flex items-center mb-2">
                <span class="text-2xl mr-2">{{ prompt.icon }}</span>
                <span class="font-medium text-gray-800">
                  {{ prompt.title }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ prompt.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.prompts-container {
  overflow: hidden;
  padding: 1rem 0;
}

.prompts-track {
  display: flex;
  gap: 1rem;
  animation: scroll 10s linear infinite;
}

.prompts-track.paused {
  animation-play-state: paused;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
