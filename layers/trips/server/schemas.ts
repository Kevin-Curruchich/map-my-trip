import { z } from "zod";

export const CreateTripExampleSchema = z.object({
  lang: z.string().default("eng"),
});

export const TripExampleSchemaResponse = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export const CreateTripSchema = z.object({
  prompt: z.string().min(10).max(500),
});

export const TripPlannerResponse = z.object({
  title: z.string(),
  description: z.string(),
  itinerary: z.array(
    z.object({
      day: z.number(),
      activities: z.array(
        z.object({
          name: z.string(),
          activityType: z.enum([
            "eat",
            "shop",
            "visit",
            "exercise",
            "relax",
            "explore",
            "learn",
          ]),
        })
      ),
    })
  ),
});
