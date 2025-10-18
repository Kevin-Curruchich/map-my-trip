<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});
const input = ref("");
const isLoading = ref(false);

const { tripsExamples, fetchTripsExamples } = useTripsExamples();
const { createTripAndNavigate } = useTrips();

// Functions
async function handleSubmit(event: Event) {
  event.preventDefault();

  if (!input.value.trim()) return;

  isLoading.value = true;

  try {
    await createTripAndNavigate(input.value.trim());
    input.value = "";
  } catch (error) {
    console.error("Error creating trip:", error);
    // Optionally, show a user-friendly error message here
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
  <div class="min-h-screen bg-background">
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="text-center mb-12">
        <div class="mb-8">
          <h2 class="text-4xl font-bold text-foreground mb-4">
            Plan Your Perfect Trip
          </h2>
          <p
            class="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Tell me about your dream destination, travel style, or what you'd
            like to experience. I'll help you create a personalized itinerary
            with the best places to visit, eat, and stay.
          </p>
        </div>

        <!-- Chat Input - Now Primary -->
        <div class="mb-12">
          <form class="max-w-2xl mx-auto" @submit="handleSubmit">
            <div class="flex items-start space-x-4">
              <div class="flex-1">
                <UTextarea
                  v-model="input"
                  placeholder="Describe your ideal trip... (e.g., 'I want a romantic getaway in Paris for 5 days')"
                  :rows="2"
                  :maxrows="4"
                  autoresize
                  :disabled="isLoading"
                  class="w-full text-lg"
                  @keydown="handleKeyDown"
                />
              </div>
              <UButton
                type="submit"
                :disabled="!input.trim() || isLoading"
                :loading="isLoading"
                size="xl"
                icon="i-heroicons-arrow-right-20-solid"
              />
            </div>
          </form>
        </div>

        <!-- Travel Examples - Now Secondary -->
        <div class="mb-8">
          <h3
            class="text-base font-medium text-muted-foreground mb-6 text-center"
          >
            Need inspiration? Try one of these popular trip ideas:
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
            <UCard
              v-for="example in tripsExamples"
              :key="example.title"
              class="cursor-pointer transition-all hover:shadow-md hover:scale-102 border-dashed"
              @click="selectExample(example)"
            >
              <div class="p-3 text-center">
                <h4 class="font-medium text-foreground text-sm mb-1">
                  {{ example.title }}
                </h4>
                <p class="text-xs text-muted-foreground">
                  {{ example.description }}
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
