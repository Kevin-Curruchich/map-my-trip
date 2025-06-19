<script setup>
// SEO Meta tags
useSeoMeta({
  title: "MapMyTrip - Intelligent Travel Planning Made Easy",
  ogTitle: "MapMyTrip - Intelligent Travel Planning Made Easy",
  description:
    "Transform how you plan and organize your travels with MapMyTrip. Get optimized routes, personalized recommendations, and interactive maps all in one place.",
  ogDescription:
    "Transform how you plan and organize your travels with MapMyTrip. Get optimized routes, personalized recommendations, and interactive maps all in one place.",
  ogImage: "/og-image.jpg",
  twitterCard: "summary_large_image",
  keywords:
    "travel planning, trip planner, route optimization, travel itinerary, Google Maps, travel assistant, vacation planning",
  author: "MapMyTrip",
  robots: "index, follow",
});

// Structured data for SEO
useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "MapMyTrip",
        description:
          "Intelligent travel planning web application with route optimization and personalized recommendations",
        url: "https://mapmytrip.com",
        applicationCategory: "TravelApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }),
    },
  ],
});

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/dashboard",
    redirectUnauthenticatedTo: "/auth",
  },
});

const router = useRouter();

const onStartPlanning = () => {
  // Navigate to the trip planning page
  router.push("/auth");
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold">MapMyTrip</h1>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600">Features</a>
            <a href="#benefits" class="text-gray-600">Benefits</a>
            <a href="#how-it-works" class="text-gray-600">How It Works</a>
            <UButton
              class="text-white px-6 py-2 rounded-lg"
              @click="onStartPlanning"
            >
              Start Planning
            </UButton>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main>
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your
            <span class="">Travel Planning</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            An innovative web application that creates optimized routes,
            personalized recommendations, and interactive maps for the modern
            traveler.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              class="px-8 py-4 rounded-lg text-lg font-semibold"
              variant="outline"
            >
              Watch Demo
            </UButton>
            <UButton
              class="px-8 py-4 rounded-lg text-lg font-semibold"
              @click="onStartPlanning"
            >
              Start Planning Your Trip
            </UButton>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Google Maps Platform
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience intelligent travel planning with cutting-edge
              technology
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6">
              <div
                class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Route Optimization
              </h3>
              <p class="text-gray-600">
                Generate efficient itineraries that minimize travel time and
                maximize your experience.
              </p>
            </div>

            <div class="text-center p-6">
              <div
                class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Personalized Recommendations
              </h3>
              <p class="text-gray-600">
                Discover places that match your interests, budget, and
                preferences beyond obvious tourist spots.
              </p>
            </div>

            <div class="text-center p-6">
              <div
                class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Interactive Maps
              </h3>
              <p class="text-gray-600">
                Visualize your entire trip with detailed maps showing
                attractions, restaurants, and accommodations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section id="benefits" class="bg-gray-50 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MapMyTrip?
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the benefits that make travel planning effortless and
              enjoyable
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                ⏰ Saves Time and Effort
              </h3>
              <p class="text-gray-600">
                No more jumping between multiple websites. All your travel
                planning is centralized in one intuitive platform.
              </p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                🎯 Optimized Planning
              </h3>
              <p class="text-gray-600">
                Intelligent suggestions and route visualization create efficient
                itineraries that maximize your travel experience.
              </p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                💎 Personalized Discovery
              </h3>
              <p class="text-gray-600">
                Reveal hidden gems that align with your interests, going beyond
                obvious tourist attractions.
              </p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                😌 Reduces Stress
              </h3>
              <p class="text-gray-600">
                Clear organization decreases planning anxiety, letting you enjoy
                the process of preparing your trip.
              </p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                🔄 Maximum Flexibility
              </h3>
              <p class="text-gray-600">
                Make quick adjustments to your itinerary on the fly, perfect for
                adapting to unexpected changes.
              </p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                🌍 All-in-One Solution
              </h3>
              <p class="text-gray-600">
                From routes to restaurants, attractions to accommodations -
                everything you need in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="how-it-works" class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How MapMyTrip Works
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to create your perfect travel itinerary
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div
                class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
              >
                1
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Set Your Destination
              </h3>
              <p class="text-gray-600">
                Tell us where you want to go and when you're planning to travel.
              </p>
            </div>

            <div class="text-center">
              <div
                class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
              >
                2
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Define Preferences
              </h3>
              <p class="text-gray-600">
                Share your interests, budget, cuisine preferences, and desired
                activities.
              </p>
            </div>

            <div class="text-center">
              <div
                class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
              >
                3
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Get Your Itinerary
              </h3>
              <p class="text-gray-600">
                Receive optimized routes and personalized recommendations on an
                interactive map.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-primary py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p class="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the joy of
            stress-free trip planning.
          </p>
          <UButton
            class="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold"
          >
            Start Planning Now - It's Free!
          </UButton>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">MapMyTrip</h3>
            <p class="text-gray-400">
              Transforming travel planning with intelligent technology and
              personalized experiences.
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400">
              <li>
                <a href="#" class="">Features</a>
              </li>
              <li>
                <a href="#" class="">How It Works</a>
              </li>
              <li>
                <a href="#" class="">Pricing</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Support</h4>
            <ul class="space-y-2 text-gray-400">
              <li>
                <a href="#" class="">Help Center</a>
              </li>
              <li>
                <a href="#" class="">Contact Us</a>
              </li>
              <li>
                <a href="#" class="">FAQ</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li>
                <a href="#" class="">Privacy Policy</a>
              </li>
              <li>
                <a href="#" class="">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
        >
          <p>&copy; 2025 MapMyTrip. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
