<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { locales, setLocale, t } = useI18n();

const { signOut, data: session } = useAuth();

const defaultLanguage = ref<"en" | "es">("es");

const items = ref<DropdownMenuItem>([
  {
    label: session.value?.user?.name || "Guest",
    avatar: {
      src:
        session.value?.user?.image || "https://ui-avatars.com/api/?name=Guest",
    },
  },
  {
    label: "Change Language",
    icon: "i-lucide-globe",

    children: locales.value.map((locale) => ({
      label: locale.name,
      value: locale.code,
      onClick: () => {
        defaultLanguage.value = locale.code as "en" | "es";
        setLocale(locale.code);
      },
    })),
  },

  {
    label: t("signOut"),
    icon: "i-lucide-log-out",
    onClick: () => onSignOut(),
  },
]);

const onSignOut = async () => {
  await signOut({
    redirect: true,
    callbackUrl: "/",
  });
};
</script>

<template>
  <div class="flex justify-between items-start p-3 sm:p-4 shadow-md gap-3">
    <h1 class="text-2xl sm:text-3xl font-bold">MapMyTrip</h1>

    <UDropdownMenu :items="items">
      <UButton icon="i-lucide-menu" color="neutral" variant="outline" />
    </UDropdownMenu>
  </div>
  <slot />
</template>
