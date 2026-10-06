import { desc, eq, inArray, or } from "drizzle-orm";
import { EventSlugListQuerySchema } from "../../schemas";

// Everything the signed-in user can come back to: their trips, the group
// plans they created, and the ones they joined from this browser (`slugs`,
// remembered client-side because joining doesn't need an account).
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { slugs } = await getValidatedQuery(
    event,
    EventSlugListQuerySchema.parse
  );

  const db = useDb();
  const [trips, events] = await Promise.all([
    db
      .select({
        id: tables.trips.id,
        title: tables.trips.title,
        destination: tables.trips.destination,
        createdAt: tables.trips.createdAt,
      })
      .from(tables.trips)
      .where(eq(tables.trips.ownerSub, user.sub))
      .orderBy(desc(tables.trips.createdAt)),
    db
      .select({
        slug: tables.events.slug,
        title: tables.events.title,
        city: tables.events.city,
        date: tables.events.date,
        status: tables.events.status,
        ownerSub: tables.events.ownerSub,
        createdAt: tables.events.createdAt,
      })
      .from(tables.events)
      .where(
        slugs.length
          ? or(
              eq(tables.events.ownerSub, user.sub),
              inArray(tables.events.slug, slugs)
            )
          : eq(tables.events.ownerSub, user.sub)
      )
      .orderBy(desc(tables.events.createdAt)),
  ]);

  return {
    trips,
    events: events.map(({ ownerSub, ...rest }) => ({
      ...rest,
      isOwner: ownerSub === user.sub,
    })),
  };
});
