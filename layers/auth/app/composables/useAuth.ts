export const useAuth = () => {
  const { user, loggedIn, clear } = useUserSession();

  const isAuthenticated = computed(() => loggedIn.value);
  const userName = computed(() => (user.value as GoogleUser)?.name || "Guest");
  const userPicture = computed(() => (user.value as GoogleUser)?.picture || "");

  const logout = async () => {
    try {
      await clear();
      // Optionally, redirect to the homepage or login page after logout
      await navigateTo("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    user: readonly(user),
    loggedIn,
    logout,
    isAuthenticated,
    userName,
    userPicture,
  };
};
