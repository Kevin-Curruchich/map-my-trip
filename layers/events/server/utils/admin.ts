import type { H3Event } from "h3";

// Admins are the Google accounts listed in NUXT_ADMIN_EMAILS.
export async function isAdmin(event: H3Event) {
  const { user } = await getUserSession(event);
  if (!user?.email || !user.email_verified) return false;

  const admins = useRuntimeConfig(event)
    .adminEmails.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}

export async function requireAdmin(event: H3Event) {
  if (!(await isAdmin(event))) {
    throw createError({ statusCode: 403, statusMessage: "Admins only" });
  }
}
