import { RecommendedPlaceBodySchema } from "../../../schemas";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readValidatedBody(event, RecommendedPlaceBodySchema.parse);

  const [created] = await useDb()
    .insert(tables.recommendedPlaces)
    .values(body)
    .returning();

  setResponseStatus(event, 201);
  return created;
});
