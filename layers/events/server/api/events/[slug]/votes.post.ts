import { and, eq } from "drizzle-orm";
import { EventSlugParamsSchema, VoteBodySchema } from "../../../schemas";

export default defineEventHandler(async (event) => {
  const { slug } = await getValidatedRouterParams(
    event,
    EventSlugParamsSchema.parse
  );
  const { participantId, proposalId } = await readValidatedBody(
    event,
    VoteBodySchema.parse
  );

  const db = useDb();
  const found = await db.query.events.findFirst({
    columns: { id: true, status: true },
    where: eq(tables.events.slug, slug),
  });

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }
  if (found.status !== "voting") {
    throw createError({
      statusCode: 409,
      statusMessage: "Voting is not open",
    });
  }

  const [participant, proposal] = await Promise.all([
    db.query.participants.findFirst({
      columns: { id: true },
      where: and(
        eq(tables.participants.id, participantId),
        eq(tables.participants.eventId, found.id)
      ),
    }),
    db.query.proposals.findFirst({
      columns: { id: true },
      where: and(
        eq(tables.proposals.id, proposalId),
        eq(tables.proposals.eventId, found.id)
      ),
    }),
  ]);

  if (!participant || !proposal) {
    throw createError({
      statusCode: 404,
      statusMessage: "Participant or proposal not found",
    });
  }

  await db
    .insert(tables.votes)
    .values({ eventId: found.id, participantId, proposalId })
    .onConflictDoUpdate({
      target: [tables.votes.eventId, tables.votes.participantId],
      set: { proposalId, createdAt: new Date() },
    });

  return { proposalId };
});
