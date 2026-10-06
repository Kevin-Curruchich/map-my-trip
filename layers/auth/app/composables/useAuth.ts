export const useAuth = () => {
  const { user, loggedIn, clear } = useUserSession();

  const userName = computed(() => user.value?.name ?? "Guest");
  const userPicture = computed(() => user.value?.picture ?? "");

  async function logout() {
    await clear();
    await navigateTo("/");
  }

  return {
    user,
    loggedIn,
    userName,
    userPicture,
    logout,
  };
};
