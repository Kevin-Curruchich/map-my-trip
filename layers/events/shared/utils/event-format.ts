// "2026-10-10" -> "sábado, 10 de octubre". Parsed as a local date on purpose:
// `new Date("2026-10-10")` would be UTC midnight and can show the day before.
export function formatEventDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year!, month! - 1, day!));
}

export function eventMapUrl(event: {
  city: string;
  placeId: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const query =
    event.latitude !== null && event.longitude !== null
      ? `${event.latitude},${event.longitude}`
      : event.city;
  const params = new URLSearchParams({ api: "1", query });
  if (event.placeId) params.set("query_place_id", event.placeId);
  return `https://www.google.com/maps/search/?${params}`;
}
