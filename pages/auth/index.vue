<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/dashboard",
    redirectUnauthenticatedTo: "/auth",
  },
});

const { signIn } = useAuth();
</script>

<template>
  <div>
    <div class="p-4">
      <h1 class="text-3xl font-bold">MapMyTrip</h1>
    </div>

    <div class="flex flex-col items-center justify-center h-96 gap-4">
      <UCard class="mx-auto" :shadow="true">
        <template #header>
          <p>{{ $t("signInWith") }}</p>
        </template>

        <UButton
          @click="signIn('google')"
          class="w-full flex items-center justify-center"
        >
          Google
          <UIcon name="mdi:google" class="ml-2" />
        </UButton>
      </UCard>
    </div>
  </div>
</template>
