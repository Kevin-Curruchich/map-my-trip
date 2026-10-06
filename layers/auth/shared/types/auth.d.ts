// Types the session user returned by `useUserSession()` / `getUserSession()`.
declare module "#auth-utils" {
  interface User {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  }

  interface UserSession {
    provider: "google";
    loggedInAt: Date;
  }
}

export {};
