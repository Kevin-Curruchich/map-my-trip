import { desc, sql } from "drizzle-orm";

// Every recommended place with how it performs: how many proposals offered it
// and how many of those won the vote. Useful when talking to the business.
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const t = tables.recommendedPlaces;
  // Proposal steps are JSON; containment matches any step with this place.
  // Written with explicit aliases: inside a subquery Drizzle leaves column
  // names unqualified, and "id" exists in every table.
  const usedIn = sql`pr.steps @> jsonb_build_array(jsonb_build_object('place', jsonb_build_object('id', ${t}.id::text)))`;

  return useDb()
    .select({
      place: t,
      appearances: sql<number>`(
        select count(*)::int from ${tables.proposals} pr where ${usedIn}
      )`,
      wins: sql<number>`(
        select count(*)::int from ${tables.proposals} pr
        join ${tables.events} ev on ev.winning_proposal_id = pr.id
        where ${usedIn}
      )`,
    })
    .from(t)
    .orderBy(desc(t.createdAt));
});
