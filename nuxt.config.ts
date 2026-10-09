// https://nuxt.com/docs/api/configuration/nuxt-config
// Layers under ./layers are auto-registered; shared settings live here only.
export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  // The evals run as Nitro tasks: GET /_nitro/tasks/<name> on the dev server.
  nitro: { experimental: { tasks: true } },
});
