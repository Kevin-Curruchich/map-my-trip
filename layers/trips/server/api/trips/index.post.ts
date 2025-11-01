import { CreateTripInputState } from "../../schemas";
import { tripGenerator } from "../../services/trip-generator.service";

export default defineEventHandler(async (event) => {
  const { success, data } = await readValidatedBody(
    event,
    CreateTripInputState.safeParse
  );

  if (!success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  try {
    const response = await tripGenerator(data.prompt);

    const store = useStorage("local");
    await store.setItem("newTripCreated", true);

    return { response: response };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Failed to generate trip" +
        (error instanceof Error ? `: ${error.message}` : ""),
    });
  }
});
