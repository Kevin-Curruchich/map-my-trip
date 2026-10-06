export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    if (!user.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Google OAuth did not return an email.",
      });
    }

    await setUserSession(event, {
      user: {
        sub: user.sub,
        email: user.email,
        email_verified: user.email_verified,
        name: user.name,
        given_name: user.given_name,
        family_name: user.family_name,
        picture: user.picture,
      },
      provider: "google",
      loggedInAt: new Date(),
    });

    return sendRedirect(event, "/plans");
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/login");
  },
});
