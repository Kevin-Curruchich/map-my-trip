export default defineOAuthGoogleEventHandler({
  config: {},
  async onSuccess(event, { user }) {
    console.log("Google OAuth user info:", user);

    if (!user.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Google OAuth did not return an email.",
      });
    }

    const googleUser: GoogleUser = {
      sub: user.sub,
      email: user.email,
      email_verified: user.email_verified,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
    };

    await setUserSession(event, {
      user: googleUser,
      provider: "google",
      loggedInAt: new Date(),
    });

    return sendRedirect(event, "/trips");
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
