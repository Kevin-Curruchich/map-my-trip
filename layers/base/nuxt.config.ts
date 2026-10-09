export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  css: ["#layers/base/app/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "es" },
    },
  },
});
