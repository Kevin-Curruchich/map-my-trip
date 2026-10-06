<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const appConfig = useAppConfig();
const { loggedIn, userName, userPicture, logout } = useAuth();

const userMenu = computed<DropdownMenuItem[]>(() => [
  { label: userName.value, type: "label", icon: "i-lucide-user" },
  { type: "separator" },
  { label: "Mis planes", icon: "i-lucide-list", to: "/plans" },
  { label: "Sign out", icon: "i-lucide-log-out", onSelect: logout },
]);
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-md">
    <div class="container mx-auto flex items-center justify-between px-4 py-4">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="flex size-8 items-center justify-center rounded-lg bg-primary">
          <span class="text-lg font-bold text-inverted">M</span>
        </div>
        <span class="text-xl font-bold text-highlighted">
          {{ appConfig.title }}
        </span>
      </NuxtLink>

      <div v-if="loggedIn" class="flex items-center gap-3">
        <UButton to="/plans" variant="ghost" color="neutral" size="sm" icon="i-lucide-list">
          Mis planes
        </UButton>
        <UDropdownMenu :items="userMenu">
          <UAvatar :src="userPicture" :alt="userName" size="sm" class="cursor-pointer" />
        </UDropdownMenu>
      </div>

      <div v-else class="flex items-center gap-4">
        <p class="hidden text-sm text-muted sm:block">
          Your AI-powered travel planning assistant
        </p>
        <UButton variant="outline" size="sm" to="/trips">New Trip</UButton>
      </div>
    </div>
  </header>
</template>
