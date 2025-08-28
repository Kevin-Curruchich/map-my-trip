import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { LangChainService } from "./langchain.service";
import { tripSchema, type Trip } from "~/server/utils/schemas/trip-schema";
import { TRIP_PLANNER_SYSTEM_PROMPT } from "~/server/utils/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export class TripPlannerService {
  private langchainService: LangChainService;
  //   private parser: StructuredOutputParser<typeof tripSchema>;

  constructor() {
    this.langchainService = LangChainService.getInstance();
    // this.parser = StructuredOutputParser.fromZodSchema(tripSchema);
  }

  async generateTripPlan(userMessage: string): Promise<Trip> {
    const model = this.langchainService.getTripPlannerModel();

    const parser = new JsonOutputParser();

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", TRIP_PLANNER_SYSTEM_PROMPT],
      ["human", "{input}"],
    ]);

    const chain = RunnableSequence.from([promptTemplate, model, parser]);

    try {
      const result = await chain.invoke({
        input: userMessage,
      });

      const validateResult = tripSchema.parse(result);

      if (!validateResult) {
        throw new Error("Invalid trip plan structure");
      }

      return validateResult;
    } catch (error) {
      console.error("Trip planning error:", error);
      throw new Error(`Failed to generate trip plan`);
    }
  }

  // Future methods for trip planning
  async optimizeTripRoute(trip: Trip): Promise<Trip> {
    // Logic to optimize route using Google Maps
    return trip;
  }

  async estimateTripCosts(trip: Trip): Promise<Trip> {
    // Logic to update cost estimates
    return trip;
  }
}
