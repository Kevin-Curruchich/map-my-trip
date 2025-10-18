export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated.value) {
    return navigateTo("/");
  }
});
