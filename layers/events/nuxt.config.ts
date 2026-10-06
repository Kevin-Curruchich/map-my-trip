// The connection string comes from NUXT_DATABASE_URL at runtime.
// Without it the events pages and API are unavailable, but the rest of the app works.
export default defineNuxtConfig({
  runtimeConfig: {
    databaseUrl: "",
  },
});
