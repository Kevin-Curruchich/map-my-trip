// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["nuxt-auth-utils"],
  runtimeConfig: {
    oauth: {
      google: {
        clientId: "",
        clientSecret: "",
        redirectURL: "",
      },
    },
  },

  nitro: {
    preset: "aws-amplify",
  },
});
