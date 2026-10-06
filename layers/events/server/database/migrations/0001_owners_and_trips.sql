CREATE TABLE "map_my_trip_db"."trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_sub" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"destination" text NOT NULL,
	"itinerary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "map_my_trip_db"."events" ADD COLUMN "owner_sub" text;--> statement-breakpoint
CREATE INDEX "trips_owner_sub_idx" ON "map_my_trip_db"."trips" USING btree ("owner_sub");--> statement-breakpoint
CREATE INDEX "events_owner_sub_idx" ON "map_my_trip_db"."events" USING btree ("owner_sub");