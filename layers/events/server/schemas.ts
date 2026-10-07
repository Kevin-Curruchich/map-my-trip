import { z } from "zod";
import { eventBudgetValues } from "~~/layers/events/shared/constants/event-options.constant";
import {
  partnerStatusValues,
  placeCategoryValues,
} from "~~/layers/events/shared/constants/place-options.constant";

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

// Google's limits: session tokens are URL-safe base64, up to 36 characters.
const SessionTokenSchema = z.string().regex(/^[\w-]{8,36}$/);

export const PlaceAutocompleteQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
  session: SessionTokenSchema,
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const PlaceDetailsParamsSchema = z.object({
  placeId: z.string().regex(/^[\w-]{10,300}$/),
});

export const PlaceDetailsQuerySchema = z.object({
  session: SessionTokenSchema.optional(),
});

export const EventSlugListQuerySchema = z.object({
  slugs: z
    .string()
    .default("")
    .transform((value) => value.split(",").filter(Boolean))
    .pipe(z.array(z.string().regex(/^[a-z0-9]{8}$/)).max(50)),
});

export const VoteBodySchema = z.object({
  participantId: z.uuid(),
  proposalId: z.uuid(),
});

export const CloseEventBodySchema = z.object({
  // Defaults to the most voted proposal.
  proposalId: z.uuid().optional(),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()
    .optional();

export const RecommendedPlaceBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalText(400),
  category: z.enum(placeCategoryValues),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(15).default([]),
  priceLevel: z.enum(eventBudgetValues).nullable().optional(),
  address: optionalText(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  googlePlaceId: optionalText(300),
  instagram: optionalText(120),
  whatsapp: optionalText(30),
  website: z.url().max(300).nullable().optional().or(z.literal("").transform(() => null)),
  partnerStatus: z.enum(partnerStatusValues).default("prospect"),
  active: z.boolean().default(true),
  notes: optionalText(2000),
});

export const RecommendedPlaceIdParamsSchema = z.object({ id: z.uuid() });
