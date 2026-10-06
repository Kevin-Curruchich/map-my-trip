-- Free-text dates from the first version can't be converted; keep only ISO ones.
ALTER TABLE "events" ALTER COLUMN "date" SET DATA TYPE date USING (CASE WHEN "date" ~ '^\d{4}-\d{2}-\d{2}$' THEN "date"::date END);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "place_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "longitude" double precision;