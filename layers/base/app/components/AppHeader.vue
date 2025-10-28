<script lang="ts" setup>
const appCong = useAppConfig();
const router = useRouter();
const { isAuthenticated, userName, userPicture, logout } = useAuth();

async function handleCreateTrip() {
  if (!isAuthenticated.value) {
    await router.push("/login");
    return;
  }

  await router.push("/trips");
}

async function handleLogout() {
  await logout();
}
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
  >
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
          >
            <span class="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <h1 class="text-xl font-bold text-foreground">
            {{ appCong.title }}
          </h1>
        </div>
        <div v-if="isAuthenticated">
          <UDropdownMenu
            :items="[
              {
                label: userName,
                type: 'label',
                icon: 'i-lucide-user',
              },
              { type: 'separator' },
              {
                label: 'Sign out',
                icon: 'i-lucide-log-out',
                onSelect: handleLogout,
              },
            ]"
          >
            <UAvatar
              :src="userPicture"
              :alt="userName"
              size="sm"
              class="cursor-pointer"
            />
          </UDropdownMenu>
        </div>
        <div v-else class="flex items-center space-x-4">
          <p class="text-sm text-muted-foreground hidden sm:block">
            Your AI-powered travel planning assistant
          </p>
          <UButton variant="outline" size="sm" @click="handleCreateTrip">
            New Trip
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
