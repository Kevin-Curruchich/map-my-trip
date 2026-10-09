// Remembers where to come back to and starts the Google OAuth flow; the
// callback (server/routes/auth/google.get.ts) reads the cookie.
export function useGoogleLogin() {
  const redirectCookie = useCookie<string | null>(AUTH_REDIRECT_COOKIE, {
    maxAge: 60 * 10,
    sameSite: "lax",
    path: "/",
  });
  const isRedirecting = ref(false);

  async function signInWithGoogle(redirectTo: unknown) {
    isRedirecting.value = true;
    redirectCookie.value = safeRedirect(redirectTo);
    // Let useCookie write document.cookie before leaving the page.
    await nextTick();
    await navigateTo("/auth/google", { external: true });
  }

  return { signInWithGoogle, isRedirecting };
}
