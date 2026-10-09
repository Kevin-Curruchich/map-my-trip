// Where to send someone after Google sign-in. Only a path on this site is
// accepted, so the login can't be used to bounce people to another domain.
export const AUTH_REDIRECT_COOKIE = "auth-redirect";

export function safeRedirect(value: unknown, fallback = "/plans"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  // "//host" and "/\host" are protocol-relative to browsers; browsers also
  // drop tabs and newlines, so "/\t/host" would become "//host".
  if (/^\/[/\\]/.test(value) || /[\s\\]/.test(value)) return fallback;
  // Encoded variants ("/%2F/host", "/%09/host") are checked once decoded.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (/^\/[/\\]/.test(decoded) || /[\s\\]/.test(decoded)) return fallback;
  return value;
}
