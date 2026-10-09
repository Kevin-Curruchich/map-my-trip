export default defineAppConfig({
  title: "MapMyTrip",
  ui: {
    colors: {
      primary: "mango",
      success: "verde",
      neutral: "stone",
    },
    button: {
      // White on mango fails contrast; solid primary buttons use dark text.
      compoundVariants: [
        { color: "primary", variant: "solid", class: "text-mango-950" },
      ],
    },
  },
});
