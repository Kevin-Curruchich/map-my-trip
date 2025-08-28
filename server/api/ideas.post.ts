import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { TRIP_IDEAS_PROMPT } from "../utils/prompts";
import { ideaSchema } from "../utils/schemas/idea-schema";

export default defineEventHandler(async (event) => {
  const { language } = await readBody(event);

  console.log({ language });

  // Initialize the model
  const model = new ChatOpenAI({
    model: "o1-mini",
    openAIApiKey: useRuntimeConfig().openaiApiKey,
  });

  console.log("Model initialized");

  const parser = new JsonOutputParser();

  try {
    const promptTemplate = ChatPromptTemplate.fromTemplate(TRIP_IDEAS_PROMPT);

    const chain = RunnableSequence.from([promptTemplate, model, parser]);
    const result = await chain.invoke({
      language: language,
    });

    console.log(result);

    const validateResult = ideaSchema.parse(result);
    if (!validateResult) {
      throw new Error("Invalid trip plan structure");
    }

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
