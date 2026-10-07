import { eq } from "drizzle-orm";
import {
  RecommendedPlaceBodySchema,
  RecommendedPlaceIdParamsSchema,
} from "../../../schemas";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const { id } = await getValidatedRouterParams(
    event,
    RecommendedPlaceIdParamsSchema.parse
  );
  const body = await readValidatedBody(
    event,
    RecommendedPlaceBodySchema.parse
  );

  const [updated] = await useDb()
    .update(tables.recommendedPlaces)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(tables.recommendedPlaces.id, id))
    .returning();

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Place not found" });
  }
  return updated;
});
