import * as z from "zod/v4";

// Activity schema
export const activitySchema = z.object({
  title: z.string().describe("Activity name"),
  description: z.string().describe("Detailed activity description"),
  location: z
    .string()
    .describe("Specific address or place name for Google Maps"),
  google_place_name: z
    .string()
    .describe("Exact place name for Google Places API search"),
  activity_type: z
    .enum([
      "sightseeing",
      "dining",
      "accommodation",
      "transportation",
      "entertainment",
      "shopping",
      "outdoor",
      "cultural",
      "relaxation",
    ])
    .describe("Type of activity"),
  start_time: z.string().describe("Start time in HH:MM format"),
  end_time: z.string().describe("End time in HH:MM format"),
  estimated_duration: z.number().describe("Duration in minutes"),
  estimated_cost: z.number().describe("Estimated cost in USD"),
  order_index: z.number().describe("Order of activity in the day"),
  notes: z.string().optional().describe("Additional tips or information"),
});

// Day schema
export const daySchema = z.object({
  day_number: z.number().describe("Day number in the trip"),
  title: z.string().describe("Title for the day"),
  date: z
    .string()
    .optional()
    .describe("Date in YYYY-MM-DD format if specific dates provided"),
  activities: z
    .array(activitySchema)
    .describe("List of activities for the day"),
});

// Transportation schema
export const transportationSchema = z.object({
  primary_mode: z
    .enum(["driving", "walking", "transit", "flying"])
    .describe("Primary mode of transportation"),
  route_notes: z.string().describe("General transportation recommendations"),
  estimated_total_distance: z.string().describe("Total distance in km"),
  estimated_total_duration: z.string().describe("Total duration in hours"),
});

// Budget breakdown schema
export const budgetBreakdownSchema = z.object({
  accommodation: z.number().describe("Accommodation costs in USD"),
  food: z.number().describe("Food and dining costs in USD"),
  activities: z.number().describe("Activities and entertainment costs in USD"),
  transportation: z.number().describe("Transportation costs in USD"),
  miscellaneous: z.number().describe("Other miscellaneous costs in USD"),
});

// Trip metadata schema
export const tripMetadataSchema = z.object({
  title: z.string().describe("Trip title"),
  description: z.string().describe("Brief trip description"),
  duration_days: z.number().describe("Duration of trip in days"),
  estimated_budget: z.number().describe("Total estimated budget in USD"),
  difficulty_level: z
    .enum(["easy", "moderate", "hard"])
    .describe("Difficulty level of the trip"),
  tags: z.array(z.string()).describe("Tags describing the trip"),
  template_category: z
    .enum([
      "beach",
      "mountain",
      "cultural",
      "food",
      "adventure",
      "business",
      "family",
    ])
    .describe("Category of the trip template"),
});

// Main trip schema
export const tripSchema = z.object({
  trip: tripMetadataSchema,
  days: z.array(daySchema).describe("Daily itinerary"),
  transportation: transportationSchema,
  budget_breakdown: budgetBreakdownSchema,
  travel_tips: z.array(z.string()).describe("Practical travel tips"),
});

// Export types
export type Activity = z.infer<typeof activitySchema>;
export type Day = z.infer<typeof daySchema>;
export type Transportation = z.infer<typeof transportationSchema>;
export type BudgetBreakdown = z.infer<typeof budgetBreakdownSchema>;
export type TripMetadata = z.infer<typeof tripMetadataSchema>;
export type Trip = z.infer<typeof tripSchema>;
