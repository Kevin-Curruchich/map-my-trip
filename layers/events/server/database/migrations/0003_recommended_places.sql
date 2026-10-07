CREATE TABLE "map_my_trip_db"."recommended_places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"price_level" text,
	"address" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"google_place_id" text,
	"instagram" text,
	"whatsapp" text,
	"website" text,
	"partner_status" text DEFAULT 'prospect' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "recommended_places_location_idx" ON "map_my_trip_db"."recommended_places" USING btree ("latitude","longitude");