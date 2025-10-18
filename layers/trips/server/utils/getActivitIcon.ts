// Define the activityType enum
export const getActivityIcon = (type: ActivityType) => {
  const activityIcons: Record<ActivityType, string> = {
    [ActivityType.Eat]: "i-lucide-utensils",
    [ActivityType.Shop]: "i-lucide-shopping-bag",
    [ActivityType.Visit]: "i-lucide-camera",
    [ActivityType.Exercise]: "i-lucide-dumbbell",
    [ActivityType.Relax]: "i-lucide-waves",
    [ActivityType.Explore]: "i-lucide-compass",
    [ActivityType.Learn]: "i-lucide-building",
  };

  return activityIcons[type] || "i-lucide-map-pin";
};
