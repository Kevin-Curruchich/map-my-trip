// Values are overridden at runtime by NUXT_* environment variables,
// e.g. NUXT_OPENAI_API_KEY or NUXT_PUBLIC_GOOGLE_MAPS_API_KEY.
export default defineNuxtConfig({
  runtimeConfig: {
    openaiApiKey: "",
    googlePlacesApiKey: "",
    public: {
      googleMapsApiKey: "",
      googleMapsMapId: "d5e33afae207e196df9e7830",
    },
  },
});
