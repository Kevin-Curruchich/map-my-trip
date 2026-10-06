import { and, eq } from "drizzle-orm";
import { z } from "zod";

const ParamsSchema = z.object({ id: z.uuid() });

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse);

  const trip = await useDb().query.trips.findFirst({
    columns: { id: true, title: true, description: true, destination: true, itinerary: true },
    where: and(eq(tables.trips.id, id), eq(tables.trips.ownerSub, user.sub)),
  });

  if (!trip) {
    throw createError({ statusCode: 404, statusMessage: "Trip not found" });
  }

  return trip;
});
