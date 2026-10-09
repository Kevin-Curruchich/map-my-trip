// Where to send someone after Google sign-in. Only a path on this site is
// accepted, so the login can't be used to bounce people to another domain.
export const AUTH_REDIRECT_COOKIE = "auth-redirect";

// "//host" and "/\host" are protocol-relative to browsers.
const RE_OTHER_HOST = /^\/[/\\]/;
const RE_BAD_PATH_CHAR = /[\s\\]/;

// Browsers drop tabs and newlines, so "/\t/host" would become "//host"; other
// control characters can't go in a Location header at all.
function hasControlChar(value: string) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

function isSafe(value: string) {
  if (RE_OTHER_HOST.test(value) || hasControlChar(value)) return false;
  // Only the path decides where the browser goes; spaces are fine in the
  // query or hash once decoded (e.g. "?destino=New%20York").
  const path = value.split(/[?#]/, 1)[0]!;
  return !RE_BAD_PATH_CHAR.test(path);
}

export function safeRedirect(value: unknown, fallback = "/plans"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (/\s/.test(value) || !isSafe(value)) return fallback;
  // Encoded variants ("/%2F/host", "/%09/host", "/%01x") are checked decoded.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  return isSafe(decoded) ? value : fallback;
}
