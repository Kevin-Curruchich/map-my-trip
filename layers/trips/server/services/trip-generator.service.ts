import { TripExamplesResponseSchema } from "../schemas";
import { useChatModel } from "./llm.service";
import { tripGraph } from "./trip-graph.service";

export async function getTripExamples(lang: string): Promise<TripExample[]> {
  const { ideas } = await useChatModel()
    .withStructuredOutput(TripExamplesResponseSchema)
    .invoke(`
    Generate 3 creative travel trip ideas with a title and a short description in ${lang}, with an emoji for each title.
    The short description should be no more than 20 words and needs to include how long (1-2 days, 3-4 days or 5-7 days),
    how many people (solo travel, couple, small group (3-4) or family (5-6)) and the price range
    (Budget-friendly, Mid-range, Luxury) of each trip idea.
    `);

  return ideas;
}

export async function generateTrip(prompt: string): Promise<GeneratedTrip> {
  const state = await tripGraph.invoke({ prompt });

  return {
    title: state.title ?? "",
    description: state.description ?? "",
    destination: state.destination ?? "",
    itinerary: state.itinerary ?? [],
  };
}
