import { Loader } from "@googlemaps/js-api-loader";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  const loader = new Loader({
    apiKey: config.public.googleMapsApiKey || "",
    version: "weekly",
    libraries: ["places", "geometry", "drawing", "marker"], // Libraries you need
  });

  try {
    // Load the Google Maps API
    await loader.importLibrary("maps");

    // Make Google Maps available globally (optional)
    if (process.client) {
      // You can now use window.google.maps anywhere in your app
      console.log("Google Maps API loaded successfully");
    }
  } catch (error) {
    console.error("Failed to load Google Maps API:", error);
  }
});
