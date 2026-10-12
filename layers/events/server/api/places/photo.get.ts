import { PlacePhotoQuerySchema } from "../../schemas";

export default defineEventHandler(async (event) => {
  const { name, w } = await getValidatedQuery(event, PlacePhotoQuerySchema.parse);
  const uri = await getPhotoUri(name, w).catch((error) => {
    console.error(`Place photo failed for ${name}:`, error);
    throw createError({ statusCode: 502, statusMessage: "Google Places failed" });
  });
  return sendRedirect(event, uri, 302);
});
