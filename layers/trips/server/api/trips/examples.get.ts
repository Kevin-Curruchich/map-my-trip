import { CreateTripExampleSchema } from "../../schemas";
import { getTripExamples } from "../../services/trip-generator.service";

export default defineCachedEventHandler(
  async (event) => {
    const query = await getValidatedQuery(event, CreateTripExampleSchema.parse);

    const store = useStorage("local");
    await store.setItem("newTripCreated", false);

    return getTripExamples({ lang: query.lang });
  },
  {
    name: "trip-examples",
    maxAge: 60 * 60 * 24, // Cache for 24 hours
    swr: true,
    async shouldInvalidateCache() {
      const storage = useStorage("local");
      const newTripCreated = await storage.getItem<boolean>("newTripCreated");

      return newTripCreated || false;
    },
  }
);
