export const ACTIVITY_TYPES = [
  "eat",
  "shop",
  "visit",
  "exercise",
  "relax",
  "explore",
  "learn",
  // Getting from one place to the next, e.g. "Lancha a San Pedro".
  "travel",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
