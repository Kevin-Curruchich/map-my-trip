import {
  date,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const participants = pgTable(
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

export type EventRecord = typeof events.$inferSelect;
export type ParticipantRecord = typeof participants.$inferSelect;
