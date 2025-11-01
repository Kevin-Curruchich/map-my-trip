// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || "",
    googlePlacesApiKey: process.env.NUXT_GOOGLE_PLACES_API_KEY || "",
    public: {
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
  },

  nitro: {
    preset: "aws-amplify",
  },
});
