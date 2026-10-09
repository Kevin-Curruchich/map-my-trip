<template>
  <footer class="border-t border-default">
    <div class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
      <AppLogo :size="24" />
      <p class="text-sm text-muted">© {{ new Date().getFullYear() }} MapMyTrip</p>
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/Kevin-Curruchich/map-my-trip"
        target="_blank"
        aria-label="GitHub"
      />
    </div>
  </footer>
</template>
