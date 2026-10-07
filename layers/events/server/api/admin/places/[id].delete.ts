import { eq } from "drizzle-orm";
import { RecommendedPlaceIdParamsSchema } from "../../../schemas";

// Past proposals keep their copy of the place; only future ones lose it.
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const { id } = await getValidatedRouterParams(
    event,
    RecommendedPlaceIdParamsSchema.parse
  );

  await useDb()
    .delete(tables.recommendedPlaces)
    .where(eq(tables.recommendedPlaces.id, id));

  setResponseStatus(event, 204);
  return null;
});
