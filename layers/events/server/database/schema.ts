import {
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// All app tables live in this schema of the shared Supabase database,
// not in `public`.
export const DB_SCHEMA = "map_my_trip_db";
export const appSchema = pgSchema(DB_SCHEMA);

export const events = appSchema.table("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Short public id used in the shared link: /e/<slug>
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  // Human-readable place name; coordinates are set when it comes from Google
  // Places or the browser's location.
  city: text("city").notNull(),
  placeId: text("place_id"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  date: date("date", { mode: "string" }),
  description: text("description"),
  // Google account (`sub`) of the creator when they were signed in.
  ownerSub: text("owner_sub"),
  // Secret kept in the creator's browser; lets them run the vote without an
  // account. Null for events created before voting existed.
  ownerToken: text("owner_token"),
  // open: people are joining. voting: proposals are up. closed: winner picked.
  status: text("status", { enum: ["open", "voting", "closed"] })
    .notNull()
    .default("open"),
  winningProposalId: uuid("winning_proposal_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [index("events_owner_sub_idx").on(table.ownerSub)]);

export const participants = appSchema.table(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    budget: text("budget").notNull(),
    preferences: text("preferences"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("participants_event_id_idx").on(table.eventId)]
);

// The plans the AI proposes for an event; the group votes on them.
export const proposals = appSchema.table(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    budget: text("budget", { enum: ["low", "medium", "high"] }).notNull(),
    steps: jsonb("steps").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("proposals_event_id_idx").on(table.eventId)]
);

// One vote per participant and event; voting again changes it.
export const votes = appSchema.table(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("votes_event_participant_unique").on(table.eventId, table.participantId)]
);

// Trips generated from /trips, kept so the owner can find them again.
// Named saved_trips because the shared schema already had an unrelated
// `trips` table.
export const trips = appSchema.table(
  "saved_trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerSub: text("owner_sub").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    destination: text("destination").notNull(),
    itinerary: jsonb("itinerary").$type<ItineraryDay[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("saved_trips_owner_sub_idx").on(table.ownerSub)]
);

export type EventRecord = typeof events.$inferSelect;
export type ParticipantRecord = typeof participants.$inferSelect;
export type ProposalRecord = typeof proposals.$inferSelect;
