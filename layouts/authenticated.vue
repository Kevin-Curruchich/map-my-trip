<script setup lang="ts">
const { locales, setLocale } = useI18n();

const { signOut, data: session } = useAuth();

const onSignOut = async () => {
  await signOut({
    redirect: true,
    callbackUrl: "/",
  });
};

const defaultLanguage = ref<"en" | "es">("es");

watch(defaultLanguage, (newLang) => {
  setLocale(newLang);
});
</script>

<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 shadow-md gap-3 sm:gap-0"
  >
    <h1 class="text-2xl sm:text-3xl font-bold">MapMyTrip</h1>

    <nav
      class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto"
    >
      <div class="flex items-center gap-2 order-3 sm:order-1">
        <span class="text-xs sm:text-sm text-gray-600">
          {{ $t("greetings") }} {{ session?.user?.name || "Guest" }}!
        </span>
      </div>

      <div
        class="flex items-center gap-2 order-1 sm:order-2"
        role="group"
        aria-label="Language selection"
      >
        <USelect
          size="sm"
          v-model="defaultLanguage"
          :items="
            locales.map((locale) => ({
              label: locale.name,
              value: locale.code,
            }))
          "
          class="w-24 sm:w-32"
          aria-label="Select language"
        />
      </div>

      <UButton
        :aria-label="$t('signOut')"
        @click="onSignOut"
        variant="outline"
        size="sm"
        class="order-2 sm:order-3 text-sm"
      >
        {{ $t("signOut") }}
      </UButton>
    </nav>
  </div>
  <slot />
</template>
