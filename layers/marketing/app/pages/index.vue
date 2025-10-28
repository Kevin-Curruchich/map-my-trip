<script setup></script>
<template>
  <div>
    <!-- Hero Section -->
    <UPageHero
      headline="AI Powered Travel Planner"
      title="Plan Your Dream Trip"
      description="Discover, organize, and enjoy your travels with ease."
      orientation="horizontal"
      :links="[
        { label: 'Sign Up', to: '/login', color: 'primary', size: 'lg' },
        { label: 'Why MapMyTrip?', to: '#why-choose-us', variant: 'subtle' },
      ]"
    />
    <!-- Features Section -->
    <UPageSection
      id="why-choose-us"
      title="Why Choose MapMyTrip?"
      description="Explore the unique features that make travel planning a breeze."
      :features="[
        {
          title: 'Interactive Route Planning',
          description: 'Visualize and adjust routes directly on the map.',
          icon: 'i-lucide-map',
        },
        {
          title: 'Personalized Discovery',
          description: 'Find places tailored to your preferences.',
          icon: 'i-lucide-search',
        },
        {
          title: 'Itinerary Management',
          description: 'Organize your trip days and bookings.',
          icon: 'i-lucide-calendar',
        },
      ]"
    />

    <!-- Call to Action Section -->
    <UPageCTA
      title="Ready to Start Your Journey?"
      description="Sign up today and let us help you create unforgettable travel experiences."
      :links="[
        { label: 'Get Started', to: '/login', color: 'primary', size: 'lg' },
      ]"
    />

    <!-- Footer -->
    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>
      <template #right>
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/Kevin-Curruchich/map-my-trip"
          target="_blank"
          aria-label="GitHub"
        />
      </template>
    </UFooter>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
