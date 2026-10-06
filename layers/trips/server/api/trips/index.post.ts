import { CreateTripBodySchema } from "../../schemas";
import { generateTrip } from "../../services/trip-generator.service";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { prompt } = await readValidatedBody(event, CreateTripBodySchema.parse);

  let generated: GeneratedTrip;
  try {
    generated = await generateTrip(prompt);
  } catch (error) {
    console.error("Failed to generate trip:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate trip",
    });
  }

  // Saved so the trip survives a reload and shows up in "Mis planes".
  const [saved] = await useDb()
    .insert(tables.trips)
    .values({ ...generated, ownerSub: user.sub })
    .returning({ id: tables.trips.id });

  return { id: saved!.id, ...generated };
});
