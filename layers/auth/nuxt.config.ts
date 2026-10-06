export default defineNuxtConfig({
  modules: ["nuxt-auth-utils"],
  // Amplify Hosting does not expose env vars to the SSR runtime, so they are
  // read at build time here instead of relying on NUXT_* runtime overrides.
  runtimeConfig: {
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
        redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL,
      },
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || "",
    },
  },
});
