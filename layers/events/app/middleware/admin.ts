// Only accounts in NUXT_ADMIN_EMAILS get past; the API checks again anyway.
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) return navigateTo("/login");

  const { isAdmin } = await useRequestFetch()("/api/admin/me");
  if (!isAdmin) {
    throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
  }
});
