import { and, asc, eq, isNull } from "drizzle-orm";
import { EventSlugParamsSchema } from "../../../schemas";
import { generateProposals } from "../../../services/proposals.service";

// The creator asks the AI for 3 plans. Asking again replaces them and resets
// the votes, so it also works after more people join. Using the AI requires
// a Google account so every generation is tied to someone.
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
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
  // The owner token alone isn't enough once the plan belongs to an account.
  if (found.ownerSub && found.ownerSub !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only the event creator can do this",
    });
  }
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

  // Plans created signed out are claimed by the account that first uses the
  // AI on them, so they show up in "Mis planes".
  if (!found.ownerSub) {
    const claimed = await db
      .update(tables.events)
      .set({ ownerSub: user.sub })
      .where(and(eq(tables.events.id, found.id), isNull(tables.events.ownerSub)))
      .returning({ id: tables.events.id });
    // Another account claimed it between our read and this update.
    if (claimed.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: "Only the event creator can do this",
      });
    }
  }

  // Provider errors carry their own status (e.g. 401 for a bad API key),
  // which the page would mistake for "sign in"; report them as 502.
  let generated: Awaited<ReturnType<typeof generateProposals>>;
  try {
    generated = await generateProposals(found, participants);
  } catch (error) {
    console.error("Failed to generate proposals:", error);
    throw createError({
      statusCode: 502,
      statusMessage: "Could not generate proposals",
    });
  }

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
