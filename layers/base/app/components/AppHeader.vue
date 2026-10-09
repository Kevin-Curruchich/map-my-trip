<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const route = useRoute();
const { loggedIn, userName, userPicture, logout } = useAuth();

// Section links only make sense on the landing, where the sections live.
const isLanding = computed(() => route.path === "/");

const userMenu = computed<DropdownMenuItem[]>(() => [
  { label: userName.value, type: "label", icon: "i-lucide-user" },
  { type: "separator" },
  { label: "Mis planes", icon: "i-lucide-list", to: "/plans" },
  { label: "Salir", icon: "i-lucide-log-out", onSelect: logout },
]);
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-md">
    <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
      <NuxtLink to="/" aria-label="MapMyTrip, inicio">
        <AppLogo :size="30" />
      </NuxtLink>

      <nav class="flex items-center gap-1 sm:gap-2">
        <template v-if="isLanding">
          <UButton to="#como-funciona" variant="ghost" color="neutral" size="sm" class="hidden sm:inline-flex">
            Cómo funciona
          </UButton>
          <UButton to="#viajes" variant="ghost" color="neutral" size="sm" class="hidden sm:inline-flex">
            Viajes con IA
          </UButton>
        </template>

        <template v-if="loggedIn">
          <UButton to="/plans" variant="ghost" color="neutral" size="sm" icon="i-lucide-list">
            Mis planes
          </UButton>
          <UDropdownMenu :items="userMenu">
            <UAvatar :src="userPicture" :alt="userName" size="sm" class="cursor-pointer" />
          </UDropdownMenu>
        </template>
        <UButton v-else to="/login" variant="outline" color="neutral" size="sm">
          Entrar
        </UButton>
      </nav>
    </div>
  </header>
</template>
