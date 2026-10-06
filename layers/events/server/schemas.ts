import { z } from "zod";
import { eventBudgetValues } from "~~/layers/events/shared/constants/event-options.constant";

export const CreateEventBodySchema = z.object({
  title: z.string().trim().min(3).max(80),
  city: z.string().trim().min(2).max(80),
  date: z.string().trim().max(40).optional(),
  description: z.string().trim().max(500).optional(),
});

export const EventSlugParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]{8}$/),
});

export const JoinEventBodySchema = z.object({
  name: z.string().trim().min(1).max(40),
  budget: z.enum(eventBudgetValues),
  preferences: z.string().trim().max(300).optional(),
});
