import { customAlphabet } from "nanoid";
import { CreateEventBodySchema } from "../../schemas";

// Short, unambiguous slugs that read well in a WhatsApp message.
const createSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, CreateEventBodySchema.parse);

  const [created] = await useDb()
    .insert(tables.events)
    .values({
      slug: createSlug(),
      title: body.title,
      city: body.city,
      date: body.date || null,
      description: body.description || null,
    })
    .returning({ slug: tables.events.slug });

  return created!;
});
