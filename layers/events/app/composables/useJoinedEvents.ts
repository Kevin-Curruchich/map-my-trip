// Remembers, per browser, which events this person already joined.
// There are no accounts, so this is only a convenience.
export default function useJoinedEvents() {
  function storageKey(slug: string) {
    return `mapmytrip:joined:${slug}`;
  }

  function getParticipantId(slug: string) {
    if (import.meta.server) return null;
    try {
      return localStorage.getItem(storageKey(slug));
    } catch {
      return null;
    }
  }

  function markJoined(slug: string, participantId: string) {
    try {
      localStorage.setItem(storageKey(slug), participantId);
    } catch {
      // Storage can be unavailable (private mode); joining still worked.
    }
  }

  return { getParticipantId, markJoined };
}
