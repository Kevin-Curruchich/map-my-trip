// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
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
    baseURL: process.env.AUTH_BASE_URL,
    provider: {
      type: "authjs",
      defaultProvider: "google",
      addDefaultCallbackUrl: process.env.AUTH_BASE_URL || "",
    },
    globalAppMiddleware: {
      isEnabled: true,
    },
  },
  supabase: {
    redirect: false,
    clientOptions: {
      db: {
        schema: "map_my_trip_db",
      },
    },
    url: process.env.SUPABASE_URL || "",
    key: process.env.SUPABASE_ANON_KEY || "",
  },
  runtimeConfig: {
    public: {
      nodeEnv: process.env.NODE_ENV,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    },
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    authSecret: process.env.AUTH_SECRET || "",
  },
});
