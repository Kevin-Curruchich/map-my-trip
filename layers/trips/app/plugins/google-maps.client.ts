import { setOptions } from "@googlemaps/js-api-loader";

export default defineNuxtPlugin(() => {
  setOptions({
    key: useRuntimeConfig().public.googleMapsApiKey,
  });
});
