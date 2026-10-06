import {
  date,
  doublePrecision,
  index,
  jsonb,
  pgSchema,
  text,
  timestamp,
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

// Trips generated from /trips, kept so the owner can find them again.
export const trips = appSchema.table(
  "trips",
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
  (table) => [index("trips_owner_sub_idx").on(table.ownerSub)]
);

export type EventRecord = typeof events.$inferSelect;
export type ParticipantRecord = typeof participants.$inferSelect;
