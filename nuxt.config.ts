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
    baseURL: process.env.NUXT_AUTH_BASE_URL,
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
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NUXT_SUPABASE_URL || "",
      authBaseUrl: process.env.NUXT_AUTH_BASE_URL || "",
      googleMapsApiKey: process.env.NUXT_GOOGLE_MAPS_API_KEY || "",
    },
    supabaseKey: process.env.NUXT_SUPABASE_KEY || "",
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || "",
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET || "",
    googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID || "",
    authSecret: process.env.NUXT_AUTH_SECRET || "",
  },
});
