import { customAlphabet } from "nanoid";
import { CreateEventBodySchema } from "../../schemas";

// Short, unambiguous slugs that read well in a WhatsApp message.
const createSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

// Creating a plan needs a Google account: that account is the plan's owner
// and the only one who can use the AI on it or close the vote.
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, CreateEventBodySchema.parse);

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
      ownerSub: user.sub,
    })
    .returning({ slug: tables.events.slug });

  return created!;
});
