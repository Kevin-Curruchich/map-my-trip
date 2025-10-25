import { CreateTripInputState } from "../../schemas";
import { workflow } from "../../services/langgraph.service";

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

  const response = await workflow.invoke({
    prompt: data.prompt,
  });

  console.log("response", response);

  const store = useStorage("local");
  await store.setItem("newTripCreated", true);

  return { response };
});
