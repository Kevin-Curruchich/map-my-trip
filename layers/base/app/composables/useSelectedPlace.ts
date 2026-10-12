// The open place lives in ?place=<source>:<id> so a link can share it. Only
// the page's own places count: a crafted link to any other place is ignored.
export default function useSelectedPlace(allowed: MaybeRefOrGetter<PlaceRef[]>) {
  const route = useRoute();
  const router = useRouter();

  const selected = computed<PlaceRef | null>(() => {
    const value = route.query.place;
    if (typeof value !== "string") return null;
    const separator = value.indexOf(":");
    const source = value.slice(0, separator);
    const id = value.slice(separator + 1);
    return (
      toValue(allowed).find((place) => place.source === source && place.id === id) ?? null
    );
  });

  function open(place: PlaceRef) {
    const query = { ...route.query, place: `${place.source}:${place.id}` };
    // Switching places replaces the entry, so Back always closes the panel.
    return selected.value ? router.replace({ query }) : router.push({ query });
  }

  // The drawer and the Esc shortcut can both close at once; stepping back
  // twice would leave the page.
  let closing = false;
  watch(() => route.query.place, () => (closing = false));

  function close() {
    if (closing || !selected.value) return;
    closing = true;
    const { place: _place, ...query } = route.query;
    const target = router.resolve({ query }).fullPath;
    // Opened from this page: step back instead of leaving a duplicate entry
    // that would make the next Back do nothing. A shared link has none.
    if (window.history.state?.back === target) return router.back();
    return router.replace({ query });
  }

  defineShortcuts({ escape: () => selected.value && close() });

  return { selected, open, close };
}
