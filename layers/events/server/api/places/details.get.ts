import { PlaceInfoQuerySchema } from "../../schemas";
import { getPlaceInfo } from "../../services/place-info.service";

// Open to anyone with a trip or event link; the daily quota cap in Google
// Cloud Console bounds what a scraper could cost.
export default defineEventHandler(async (event) => {
  const place = await getValidatedQuery(event, PlaceInfoQuerySchema.parse);
  return getPlaceInfo(place);
});
