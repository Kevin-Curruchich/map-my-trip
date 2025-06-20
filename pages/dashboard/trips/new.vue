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

      <!-- Prompt Examples Carousel -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Need inspiration? Try these examples:
        </h2>
        <div class="flex gap-4 overflow-x-auto pb-4">
          <div
            v-for="prompt in examplePrompts"
            :key="prompt.id"
            @click="selectPrompt(prompt.text)"
            class="flex-shrink-0 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors min-w-64"
          >
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-2">{{ prompt.icon }}</span>
              <span class="font-medium text-gray-800">{{ prompt.title }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ prompt.text }}</p>
          </div>
        </div>
      </div>

      <!-- Chat Interface -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Chat Messages -->
        <div class="mb-6 space-y-4 min-h-32">
          <div
            v-if="messages.length === 0"
            class="text-center text-gray-500 py-8"
          >
            Start describing your trip ideas below...
          </div>
          <div
            v-for="message in messages"
            :key="message.id"
            :class="
              message.type === 'user'
                ? 'flex justify-end'
                : 'flex justify-start'
            "
          >
            <div
              :class="
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs'
                  : 'bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-xs'
              "
            >
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t pt-4">
          <div class="flex gap-3">
            <textarea
              v-model="userInput"
              @keydown.enter.prevent="sendMessage"
              placeholder="Describe your trip... (e.g., 'I want a 5-day romantic getaway in Europe with good food and museums')"
              class="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            ></textarea>
            <button
              @click="sendMessage"
              :disabled="!userInput.trim() || isLoading"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span v-if="isLoading">Creating...</span>
              <span v-else>Create Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
