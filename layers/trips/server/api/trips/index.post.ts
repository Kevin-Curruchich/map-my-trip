import { CreateTripSchema } from "../../schemas";
import { tripPlannerChain } from "../../services/langchain.service";

export default defineEventHandler(async (event) => {
  const { success, data } = await readValidatedBody(
    event,
    CreateTripSchema.safeParse
  );

  if (!success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  const response = await tripPlannerChain(data.prompt);

  const store = useStorage("local");
  await store.setItem("newTripCreated", true);

  return { response: response.structuredResponse };
});
