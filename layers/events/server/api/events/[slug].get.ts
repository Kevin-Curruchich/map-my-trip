import { and, asc, count, eq } from "drizzle-orm";
import { z } from "zod";
import { EventSlugParamsSchema } from "../../schemas";

// The participant id is this person's (account-less) voting credential, so it
// is never listed; a browser passes its own to learn its vote.
const QuerySchema = z.object({ participant: z.uuid().optional() });

export default defineEventHandler(async (event) => {
  const { slug } = await getValidatedRouterParams(
    event,
    EventSlugParamsSchema.parse
  );
  const { participant } = await getValidatedQuery(event, QuerySchema.parse);

  const db = useDb();
  const found = await db.query.events.findFirst({
    where: eq(tables.events.slug, slug),
  });

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  const [participants, proposals, voteCounts, myVote, isOwner] =
    await Promise.all([
      db
        .select({
          name: tables.participants.name,
          budget: tables.participants.budget,
          preferences: tables.participants.preferences,
        })
        .from(tables.participants)
        .where(eq(tables.participants.eventId, found.id))
        .orderBy(asc(tables.participants.createdAt)),
      db
        .select({
          id: tables.proposals.id,
          title: tables.proposals.title,
          description: tables.proposals.description,
          budget: tables.proposals.budget,
          steps: tables.proposals.steps,
        })
        .from(tables.proposals)
        .where(eq(tables.proposals.eventId, found.id))
        .orderBy(asc(tables.proposals.position)),
      db
        .select({ proposalId: tables.votes.proposalId, votes: count() })
        .from(tables.votes)
        .where(eq(tables.votes.eventId, found.id))
        .groupBy(tables.votes.proposalId),
      participant
        ? db.query.votes.findFirst({
            columns: { proposalId: true },
            where: and(
              eq(tables.votes.eventId, found.id),
              eq(tables.votes.participantId, participant)
            ),
          })
        : undefined,
      isEventOwner(event, found),
    ]);

  return {
    slug: found.slug,
    title: found.title,
    city: found.city,
    placeId: found.placeId,
    latitude: found.latitude,
    longitude: found.longitude,
    date: found.date,
    description: found.description,
    status: found.status,
    winningProposalId: found.winningProposalId,
    isOwner,
    myVoteProposalId: myVote?.proposalId ?? null,
    participants,
    proposals: proposals.map((proposal) => ({
      ...proposal,
      votes:
        voteCounts.find((row) => row.proposalId === proposal.id)?.votes ?? 0,
    })),
  };
});
