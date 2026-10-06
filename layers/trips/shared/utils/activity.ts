export const ACTIVITY_TYPES = [
  "eat",
  "shop",
  "visit",
  "exercise",
  "relax",
  "explore",
  "learn",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
