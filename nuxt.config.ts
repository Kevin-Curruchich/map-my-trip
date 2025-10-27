// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/test-utils"],
  nitro: {
    preset: "aws-amplify",
  },
  vite: {
    optimizeDeps: {
      include: ["debug"],
    },
  },
});
