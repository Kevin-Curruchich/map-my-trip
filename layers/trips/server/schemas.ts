import { z } from "zod";

export const TripExamplesQuerySchema = z.object({
  lang: z.string().min(2).max(20).default("English"),
});

export const TripExamplesResponseSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export const CreateTripBodySchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10)
    .max(1000)
    .describe("The user's prompt for the trip itinerary"),
});
