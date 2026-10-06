import { z } from "zod";
import { eventBudgetValues } from "~~/layers/events/shared/constants/event-options.constant";

export const CreateEventBodySchema = z.object({
  title: z.string().trim().min(3).max(80),
  location: z.object({
    label: z.string().trim().min(2).max(160),
    placeId: z.string().max(300).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  date: z.iso.date().optional(),
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

export const PlaceSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const EventSlugListQuerySchema = z.object({
  slugs: z
    .string()
    .default("")
    .transform((value) => value.split(",").filter(Boolean))
    .pipe(z.array(z.string().regex(/^[a-z0-9]{8}$/)).max(50)),
});
