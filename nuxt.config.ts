// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  nitro: {
    esbuild: {
      options: {
        format: "esm",
      },
    },
    minify: false,
  },
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/i18n",
    "@nuxt/ui",
    "@sidebase/nuxt-auth",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
    "@nuxtjs/supabase",
    "@maas/vue-equipment/nuxt",
  ],
  vueEquipment: {
    plugins: ["MagicMarquee"],
  },
  css: ["~/assets/css/main.css"],
  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "es", name: "Spanish", file: "es.json" },
    ],
    defaultLocale: "es",
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  auth: {
    isEnabled: true,
    originEnvKey: "AUTH_ORIGIN",
    baseURL: process.env.AUTH_BASE_URL,
    provider: {
      type: "authjs",
      defaultProvider: "google",
    },
    globalAppMiddleware: {
      isEnabled: true,
      addDefaultCallbackUrl: true,
    },
  },
  supabase: {
    redirect: false,
    clientOptions: {
      db: {
        schema: "map_my_trip_db",
      },
    },
  },
  runtimeConfig: {
    public: {
      authBaseUrl: process.env.AUTH_BASE_URL || "",
      authOrigin: process.env.AUTH_ORIGIN || "",
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
      supabaseUrl: process.env.SUPABASE_URL || "",
    },
    supabaseKey: process.env.SUPABASE_KEY || "",
  },
});
