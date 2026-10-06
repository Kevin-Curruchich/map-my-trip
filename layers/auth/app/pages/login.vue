<script setup lang="ts">
definePageMeta({
  layout: false,
});

const appConfig = useAppConfig();
const { loggedIn } = useAuth();

useSeoMeta({
  title: `Login - ${appConfig.title}`,
});

if (loggedIn.value) {
  await navigateTo("/trips", { replace: true });
}

const isLoading = ref(false);

async function handleGoogleLogin() {
  isLoading.value = true;
  await navigateTo("/auth/google", { external: true });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-default p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Welcome to {{ appConfig.title }}</h1>
          <p class="mt-2 text-muted">Sign in to start planning your trips</p>
        </div>
      </template>

      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        icon="i-simple-icons-google"
        block
        :loading="isLoading"
        @click="handleGoogleLogin"
      >
        {{ isLoading ? "Signing you in..." : "Continue with Google" }}
      </UButton>
    </UCard>
  </div>
</template>
