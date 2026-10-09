// Mango and green are too light for text on white (mango-500 is ~2:1), so
// every variant that puts brand color on text uses a darker shade.
const mangoText = "text-mango-800 dark:text-mango-400";
const verdeText = "text-verde-700 dark:text-verde-400";

export default defineAppConfig({
  title: "MapMyTrip",
  ui: {
    colors: {
      primary: "mango",
      success: "verde",
      neutral: "stone",
    },
    button: {
      compoundVariants: [
        // White on mango fails contrast; solid primary buttons use dark text.
        { color: "primary", variant: "solid", class: "text-mango-950" },
        { color: "primary", variant: ["outline", "soft", "subtle", "ghost", "link"], class: mangoText },
        { color: "success", variant: ["outline", "soft", "subtle", "ghost", "link"], class: verdeText },
      ],
    },
    badge: {
      compoundVariants: [
        { color: "primary", variant: "solid", class: "text-mango-950" },
        { color: "primary", variant: ["outline", "soft", "subtle"], class: mangoText },
        { color: "success", variant: ["outline", "soft", "subtle"], class: verdeText },
      ],
    },
  },
});
