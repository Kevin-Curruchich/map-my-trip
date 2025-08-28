import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);

  // Initialize the model
  const model = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.7,
    openAIApiKey: useRuntimeConfig().openaiApiKey,
  });

  const parser = new JsonOutputParser();

  try {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", TRIP_PLANNER_SYSTEM_PROMPT],
      ["human", "{input}"],
    ]);

    // Corrected chain using RunnableSequence
    const chain = RunnableSequence.from([promptTemplate, model, parser]);

    const result = await chain.invoke({
      input: message,
    });

    const validateResult = tripSchema.parse(result);
    if (!validateResult) {
      throw new Error("Invalid trip plan structure");
    }

    console.log(validateResult);

    return {
      success: true,
      data: {
        structured_data: validateResult,
        message: JSON.stringify(validateResult, null, 2), // Pretty JSON for display
      },
    };
  } catch (error) {
    console.error("Error in trip planning chain:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate trip plan`,
    });
  }
});
