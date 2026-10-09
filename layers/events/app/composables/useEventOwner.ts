// The creator's token for each event they made in this browser. It proves
// they created it (to close the vote, and with an account, to use the AI).
export default function useEventOwner() {
  function storageKey(slug: string) {
    return `mapmytrip:owner:${slug}`;
  }

  function getOwnerToken(slug: string) {
    if (import.meta.server) return null;
    try {
      return localStorage.getItem(storageKey(slug));
    } catch {
      return null;
    }
  }

  function saveOwnerToken(slug: string, token: string) {
    try {
      localStorage.setItem(storageKey(slug), token);
    } catch {
      // Without storage, a signed-in creator is still recognized by account.
    }
  }

  return { getOwnerToken, saveOwnerToken };
}
