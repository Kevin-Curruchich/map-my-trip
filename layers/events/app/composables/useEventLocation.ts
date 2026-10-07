export interface EventLocation {
  label: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
}

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

// Place search for the "¿Dónde?" field, plus the browser's own location.
// Uses Places Autocomplete with a session token: suggestions are free and
// the session is billed once, when the picked place's coordinates are read.
export default function useEventLocation() {
  const suggestions = ref<PlaceSuggestion[]>([]);
  const isSearching = ref(false);
  const isLocating = ref(false);
  const coords = ref<{ latitude: number; longitude: number }>();

  let sessionToken: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastQuery = "";

  function search(query: string) {
    clearTimeout(timer);
    const q = query.trim();
    if (q.length < 2) {
      suggestions.value = [];
      return;
    }

    sessionToken ??= crypto.randomUUID();
    timer = setTimeout(async () => {
      lastQuery = q;
      isSearching.value = true;
      try {
        const results = await $fetch("/api/places/autocomplete", {
          query: {
            q,
            session: sessionToken,
            lat: coords.value?.latitude,
            lng: coords.value?.longitude,
          },
        });
        // Ignore answers to queries the user already typed past.
        if (lastQuery === q) suggestions.value = results;
      } catch (error) {
        console.error("Place search failed:", error);
        suggestions.value = [];
      } finally {
        isSearching.value = false;
      }
    }, 250);
  }

  // Coordinates for a picked suggestion; ends the billing session.
  async function resolve(suggestion: PlaceSuggestion): Promise<EventLocation> {
    const session = sessionToken;
    sessionToken = undefined;
    const label = suggestion.address
      ? `${suggestion.name}, ${suggestion.address}`
      : suggestion.name;
    try {
      // Typed by hand: the path also matches /api/places/autocomplete.
      const details = await $fetch<Required<EventLocation>>(
        `/api/places/${encodeURIComponent(suggestion.placeId)}`,
        { query: { session } }
      );
      return {
        label,
        placeId: details.placeId,
        latitude: details.latitude,
        longitude: details.longitude,
      };
    } catch (error) {
      // The plan still works with the name; places are then found by text.
      console.error("Place details failed:", error);
      return { label, placeId: suggestion.placeId };
    }
  }

  function locate() {
    return new Promise<EventLocation>((resolvePosition, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not available"));
        return;
      }
      isLocating.value = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          isLocating.value = false;
          coords.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolvePosition({ label: "Cerca de mi ubicación", ...coords.value });
        },
        (error) => {
          isLocating.value = false;
          reject(error);
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  return { suggestions, isSearching, isLocating, search, resolve, locate };
}
