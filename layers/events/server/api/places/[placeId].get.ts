import { PlaceDetailsParamsSchema, PlaceDetailsQuerySchema } from "../../schemas";

// Coordinates of the picked suggestion; closes the autocomplete session.
export default defineEventHandler(async (event) => {
  const { placeId } = await getValidatedRouterParams(
    event,
    PlaceDetailsParamsSchema.parse
  );
  const { session } = await getValidatedQuery(
    event,
    PlaceDetailsQuerySchema.parse
  );

  return getPlaceDetails(placeId, session);
});
