import { PlaceAutocompleteQuerySchema } from "../../schemas";

// Suggestions for "¿Dónde?", biased to the browser's location when shared.
export default defineEventHandler(async (event) => {
  const { q, session, lat, lng } = await getValidatedQuery(
    event,
    PlaceAutocompleteQuerySchema.parse
  );

  return autocompletePlaces(
    q,
    session,
    lat !== undefined && lng !== undefined
      ? { latitude: lat, longitude: lng }
      : undefined
  );
});
