import { asc, eq } from "drizzle-orm";
import { EventSlugParamsSchema } from "../../../schemas";
import { generateProposals } from "../../../services/proposals.service";

// The creator asks the AI for 3 plans. Asking again replaces them and resets
// the votes, so it also works after more people join.
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
  await requireEventOwner(event, found);
  if (found.status === "closed") {
    throw createError({ statusCode: 409, statusMessage: "Event is closed" });
  }

  const participants = await db
    .select({
      name: tables.participants.name,
      budget: tables.participants.budget,
      preferences: tables.participants.preferences,
    })
    .from(tables.participants)
    .where(eq(tables.participants.eventId, found.id))
    .orderBy(asc(tables.participants.createdAt));

  if (participants.length === 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Nobody has joined yet",
    });
  }

  const generated = await generateProposals(found, participants);

  await db.transaction(async (tx) => {
    // Votes go with their proposals (on delete cascade).
    await tx
      .delete(tables.proposals)
      .where(eq(tables.proposals.eventId, found.id));
    await tx.insert(tables.proposals).values(
      generated.map((proposal, position) => ({
        eventId: found.id,
        position,
        ...proposal,
      }))
    );
    await tx
      .update(tables.events)
      .set({ status: "voting" })
      .where(eq(tables.events.id, found.id));
  });

  setResponseStatus(event, 201);
  return { status: "voting" as const };
});
