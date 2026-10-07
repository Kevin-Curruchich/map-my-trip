// The connection string comes from NUXT_DATABASE_URL at runtime.
// Without it the events pages and API are unavailable, but the rest of the app works.
// NUXT_ADMIN_EMAILS (comma separated) lists who can manage /admin/places.
export default defineNuxtConfig({
  modules: ["nuxt-og-image"],
  runtimeConfig: {
    databaseUrl: "",
    adminEmails: "",
  },
  ogImage: {
    // JPEG keeps previews small enough for WhatsApp, which skips heavy images.
    defaults: {
      extension: "jpeg",
      width: 1200,
      height: 630,
      // Short so a new share shows the latest votes and status.
      cacheMaxAgeSeconds: 60 * 5,
    },
  },
});
