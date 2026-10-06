export interface TripOption<T extends string | number = string> {
  label: string;
  value: T;
  icon?: string;
}

export const durationOptions: TripOption<number>[] = [
  { label: "1-2 days", value: 2 },
  { label: "3-4 days", value: 4 },
  { label: "5-7 days", value: 7 },
];

export const travelerOptions: TripOption<number>[] = [
  { label: "Solo travel", value: 1 },
  { label: "Couple", value: 2 },
  { label: "Small group (3-4)", value: 4 },
  { label: "Family (5-6)", value: 6 },
];

export const budgetOptions: TripOption[] = [
  { label: "Budget-friendly", value: "budget", icon: "i-lucide-circle-dollar-sign" },
  { label: "Mid-range", value: "mid-range", icon: "i-lucide-banknote" },
  { label: "Luxury", value: "luxury", icon: "i-lucide-sparkles" },
];

export const styleOptions: TripOption[] = [
  { label: "Adventure & Outdoor", value: "adventure", icon: "i-lucide-zap" },
  { label: "Cultural & Historical", value: "cultural", icon: "i-lucide-landmark" },
  { label: "Relaxation & Beach", value: "relaxation", icon: "i-lucide-sun" },
  { label: "Food & Culinary", value: "culinary", icon: "i-lucide-chef-hat" },
  { label: "Urban & City", value: "urban", icon: "i-lucide-building-2" },
  { label: "Nature & Wildlife", value: "nature", icon: "i-lucide-leaf" },
  { label: "Romantic", value: "romantic", icon: "i-lucide-heart" },
  { label: "Family-Friendly", value: "family", icon: "i-lucide-users" },
];
