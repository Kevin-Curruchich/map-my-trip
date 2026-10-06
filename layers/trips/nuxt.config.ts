export default defineNuxtConfig({
  // Read at build time: Amplify Hosting does not expose env vars to the SSR runtime.
  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || "",
    googlePlacesApiKey: process.env.NUXT_GOOGLE_PLACES_API_KEY || "",
    public: {
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      googleMapsMapId: process.env.NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "d5e33afae207e196df9e7830",
    },
  },
});
