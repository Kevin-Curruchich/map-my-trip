import { NuxtAuthHandler } from "#auth";
import Google from "next-auth/providers/google";
import { createServerUserService } from "~/server/utils/userService";

export default NuxtAuthHandler({
  debug: true,
  secret: process.env.NUXT_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production" || false,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      try {
        // Persist the OAuth access_token to the token right after signin
        if (account && profile) {
          token.sessionToken = account.access_token;
          token.profile = profile;
          token.sub = profile.sub || ""; // Use sub as the unique identifier
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        throw new Error("Failed to create JWT token");
      }
    },
    async session({ session, token }) {
      try {
        if (token?.sub) {
          const userService = createServerUserService();
          const user = await userService.findByExternalId(token.sub);
          if (user) {
            session.user.id = user.id; // Database ID
          }
          session.user.sub = token.sub; // Add sub to session user
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        throw new Error("Failed to retrieve session");
      }
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          const userService = createServerUserService();

          const existingUser = await userService.findByExternalId(
            profile.sub || ""
          );

          if (existingUser) {
            return true;
          }

          // Get free tier ID
          const freeTier = await userService.findGetFreeTier();

          // Create new user
          const newUser = await userService.createUserProfile({
            email: profile.email || "",
            name: profile.name || "",
            externalAuthId: profile.sub || "",
            authProvider: account.provider,
            avatarUrl: profile.image || "",
            userTierId: freeTier?.id, // Use free tier ID
          });

          if (!newUser) {
            throw new Error("Failed to create new user");
          }

          return true;
        } catch (error) {
          console.error("signIn callback error", error);
          throw error;
        }
      } else {
        console.warn(
          "Unsupported provider or missing profile in signIn callback"
        );
        return false; // Reject sign-in for unsupported providers
      }
    },
  },
});
