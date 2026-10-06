// https://nuxt.com/docs/api/configuration/nuxt-config
// Layers under ./layers are auto-registered; shared settings live here only.
export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  nitro: {
    preset: "aws-amplify",
  },
});
