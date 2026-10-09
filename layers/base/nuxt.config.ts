export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  css: ["#layers/base/app/assets/css/main.css"],
  // Global so nuxt-og-image can also render share images in Manrope.
  fonts: {
    families: [
      { name: "Manrope", provider: "google", weights: [400, 500, 700, 800], global: true },
    ],
  },
  app: {
    head: {
      htmlAttrs: { lang: "es" },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
      meta: [{ name: "theme-color", content: "#FFA51F" }],
    },
  },
});
