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
  latitude?: number;
  longitude?: number;
}

// Place search for the "¿Dónde?" field, plus the browser's own location.
export default function useEventLocation() {
  const suggestions = ref<PlaceSuggestion[]>([]);
  const isSearching = ref(false);
  const isLocating = ref(false);
  const coords = ref<{ latitude: number; longitude: number }>();

  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastQuery = "";

  function search(query: string) {
    clearTimeout(timer);
    const q = query.trim();
    if (q.length < 2) {
      suggestions.value = [];
      return;
    }

    timer = setTimeout(async () => {
      lastQuery = q;
      isSearching.value = true;
      try {
        const results = await $fetch("/api/places/search", {
          query: {
            q,
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
    }, 300);
  }

  function locate() {
    return new Promise<EventLocation>((resolve, reject) => {
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
          resolve({ label: "Cerca de mi ubicación", ...coords.value });
        },
        (error) => {
          isLocating.value = false;
          reject(error);
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  return { suggestions, isSearching, isLocating, search, locate };
}
