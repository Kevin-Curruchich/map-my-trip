import { and, asc, count, desc, eq } from "drizzle-orm";
import { CloseEventBodySchema, EventSlugParamsSchema } from "../../../schemas";

// The creator ends the vote. The winner is the most voted proposal (the first
// one listed on a tie) unless they pick one.
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const { slug } = await getValidatedRouterParams(
    event,
    EventSlugParamsSchema.parse
  );
  const body = await readValidatedBody(event, CloseEventBodySchema.parse);

  const db = useDb();
  const found = await db.query.events.findFirst({
    where: eq(tables.events.slug, slug),
  });

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }
  await requireEventOwner(event, found);
  if (found.status !== "voting") {
    throw createError({
      statusCode: 409,
      statusMessage: "Voting is not open",
    });
  }

  const [winner] = await db
    .select({ id: tables.proposals.id })
    .from(tables.proposals)
    .leftJoin(tables.votes, eq(tables.votes.proposalId, tables.proposals.id))
    .where(
      body.proposalId
        ? and(
            eq(tables.proposals.eventId, found.id),
            eq(tables.proposals.id, body.proposalId)
          )
        : eq(tables.proposals.eventId, found.id)
    )
    .groupBy(tables.proposals.id, tables.proposals.position)
    .orderBy(desc(count(tables.votes.id)), asc(tables.proposals.position))
    .limit(1);

  if (!winner) {
    throw createError({ statusCode: 404, statusMessage: "Proposal not found" });
  }

  await db
    .update(tables.events)
    .set({ status: "closed", winningProposalId: winner.id })
    .where(eq(tables.events.id, found.id));

  return { status: "closed" as const, winningProposalId: winner.id };
});
