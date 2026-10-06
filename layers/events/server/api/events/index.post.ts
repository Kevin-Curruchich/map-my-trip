import { customAlphabet } from "nanoid";
import { CreateEventBodySchema } from "../../schemas";

// Short, unambiguous slugs that read well in a WhatsApp message.
const createSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, CreateEventBodySchema.parse);
  // Signing in is optional; when signed in, the plan shows up in "Mis planes".
  const { user } = await getUserSession(event);

  const [created] = await useDb()
    .insert(tables.events)
    .values({
      slug: createSlug(),
      title: body.title,
      city: body.location.label,
      placeId: body.location.placeId ?? null,
      latitude: body.location.latitude ?? null,
      longitude: body.location.longitude ?? null,
      date: body.date ?? null,
      description: body.description || null,
      ownerSub: user?.sub ?? null,
    })
    .returning({ slug: tables.events.slug });

  return created!;
});
