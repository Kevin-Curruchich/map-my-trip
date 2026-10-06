CREATE SCHEMA IF NOT EXISTS "map_my_trip_db";
--> statement-breakpoint
CREATE TABLE "map_my_trip_db"."events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"city" text NOT NULL,
	"place_id" text,
	"latitude" double precision,
	"longitude" double precision,
	"date" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "map_my_trip_db"."participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"budget" text NOT NULL,
	"preferences" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."participants" ADD CONSTRAINT "participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "map_my_trip_db"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "participants_event_id_idx" ON "map_my_trip_db"."participants" USING btree ("event_id");