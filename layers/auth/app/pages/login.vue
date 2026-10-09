<script setup lang="ts">
definePageMeta({
  layout: false,
});

const route = useRoute();
const { loggedIn } = useAuth();
const { signInWithGoogle, isRedirecting } = useGoogleLogin();

useSeoMeta({
  title: "Entrar · MapMyTrip",
  robots: "noindex",
});

const redirectTo = safeRedirect(route.query.redirect);

if (loggedIn.value) {
  await navigateTo(redirectTo, { replace: true });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-default p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col items-center text-center">
          <NuxtLink to="/" aria-label="MapMyTrip, inicio">
            <AppLogo :size="40" />
          </NuxtLink>
          <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-highlighted">
            Entra para continuar
          </h1>
          <p class="mt-2 text-muted">
            Entra para usar la IA y guardar tus planes.
          </p>
        </div>
      </template>

      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        icon="i-simple-icons-google"
        block
        :loading="isRedirecting"
        @click="signInWithGoogle(redirectTo)"
      >
        {{ isRedirecting ? "Conectando con Google…" : "Continuar con Google" }}
      </UButton>

      <p class="mt-4 text-center text-xs text-dimmed">
        Tus amigos no necesitan cuenta para unirse a un plan y votar.
      </p>
    </UCard>
  </div>
</template>
