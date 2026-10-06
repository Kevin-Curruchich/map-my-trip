import { asc, eq } from "drizzle-orm";
import { EventSlugParamsSchema } from "../../schemas";

export default defineEventHandler(async (event) => {
  const { slug } = await getValidatedRouterParams(
    event,
    EventSlugParamsSchema.parse
  );

  const db = useDb();
  const found = await db.query.events.findFirst({
    where: eq(tables.events.slug, slug),
  });

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  const participants = await db
    .select({
      id: tables.participants.id,
      name: tables.participants.name,
      budget: tables.participants.budget,
      preferences: tables.participants.preferences,
    })
    .from(tables.participants)
    .where(eq(tables.participants.eventId, found.id))
    .orderBy(asc(tables.participants.createdAt));

  return {
    slug: found.slug,
    title: found.title,
    city: found.city,
    placeId: found.placeId,
    latitude: found.latitude,
    longitude: found.longitude,
    date: found.date,
    description: found.description,
    participants,
  };
});
