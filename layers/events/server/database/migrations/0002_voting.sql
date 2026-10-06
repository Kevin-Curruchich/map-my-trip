CREATE TABLE "map_my_trip_db"."proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"budget" text NOT NULL,
	"steps" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_my_trip_db"."votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"proposal_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_event_participant_unique" UNIQUE("event_id","participant_id")
);
--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."events" ADD COLUMN "owner_token" text;--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."events" ADD COLUMN "status" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."events" ADD COLUMN "winning_proposal_id" uuid;--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."proposals" ADD CONSTRAINT "proposals_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "map_my_trip_db"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."votes" ADD CONSTRAINT "votes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "map_my_trip_db"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."votes" ADD CONSTRAINT "votes_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "map_my_trip_db"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."votes" ADD CONSTRAINT "votes_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "map_my_trip_db"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "proposals_event_id_idx" ON "map_my_trip_db"."proposals" USING btree ("event_id");