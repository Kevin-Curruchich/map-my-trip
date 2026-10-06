import { eq } from "drizzle-orm";
import { EventSlugParamsSchema, JoinEventBodySchema } from "../../../schemas";

export default defineEventHandler(async (event) => {
  const { slug } = await getValidatedRouterParams(
    event,
    EventSlugParamsSchema.parse
  );
  const body = await readValidatedBody(event, JoinEventBodySchema.parse);

  const db = useDb();
  const found = await db.query.events.findFirst({
    columns: { id: true, status: true },
    where: eq(tables.events.slug, slug),
  });

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }
  if (found.status === "closed") {
    throw createError({ statusCode: 409, statusMessage: "Event is closed" });
  }

  const [participant] = await db
    .insert(tables.participants)
    .values({
      eventId: found.id,
      name: body.name,
      budget: body.budget,
      preferences: body.preferences || null,
    })
    .returning({ id: tables.participants.id });

  setResponseStatus(event, 201);
  return participant!;
});
