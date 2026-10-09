const activityIcons: Record<ActivityType, string> = {
  eat: "i-lucide-utensils",
  shop: "i-lucide-shopping-bag",
  visit: "i-lucide-camera",
  exercise: "i-lucide-dumbbell",
  relax: "i-lucide-waves",
  explore: "i-lucide-compass",
  learn: "i-lucide-building",
  travel: "i-lucide-bus",
};

export const getActivityIcon = (type: ActivityType) =>
  activityIcons[type] ?? "i-lucide-map-pin";
