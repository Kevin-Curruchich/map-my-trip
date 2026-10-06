import { CreateTripBodySchema } from "../../schemas";
import { generateTrip } from "../../services/trip-generator.service";

export default defineEventHandler(async (event) => {
  const { prompt } = await readValidatedBody(event, CreateTripBodySchema.parse);

  try {
    return await generateTrip(prompt);
  } catch (error) {
    console.error("Failed to generate trip:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate trip",
    });
  }
});
