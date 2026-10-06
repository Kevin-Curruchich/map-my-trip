import { TripExamplesQuerySchema } from "../../schemas";
import { getTripExamples } from "../../services/trip-generator.service";

export default defineCachedEventHandler(
  async (event) => {
    const { lang } = await getValidatedQuery(
      event,
      TripExamplesQuerySchema.parse
    );

    return getTripExamples(lang);
  },
  {
    name: "trip-examples",
    getKey: (event) => String(getQuery(event).lang ?? "default"),
    maxAge: 60 * 60 * 24,
    swr: true,
  }
);
