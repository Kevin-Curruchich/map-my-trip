export const placeCategoryValues = [
  "restaurant",
  "cafe",
  "bar",
  "nightlife",
  "activity",
  "nature",
  "culture",
  "shopping",
  "other",
] as const;

export type PlaceCategory = (typeof placeCategoryValues)[number];

export const placeCategoryOptions: {
  label: string;
  value: PlaceCategory;
  icon: string;
}[] = [
  { label: "Restaurante", value: "restaurant", icon: "i-lucide-utensils" },
  { label: "Café", value: "cafe", icon: "i-lucide-coffee" },
  { label: "Bar", value: "bar", icon: "i-lucide-beer" },
  { label: "Vida nocturna", value: "nightlife", icon: "i-lucide-music" },
  { label: "Actividad", value: "activity", icon: "i-lucide-ticket" },
  { label: "Naturaleza", value: "nature", icon: "i-lucide-trees" },
  { label: "Cultura", value: "culture", icon: "i-lucide-landmark" },
  { label: "Compras", value: "shopping", icon: "i-lucide-shopping-bag" },
  { label: "Otro", value: "other", icon: "i-lucide-map-pin" },
];

// Where each recommended place is in the conversation with the business.
export const partnerStatusValues = ["prospect", "contacted", "partner"] as const;

export type PartnerStatus = (typeof partnerStatusValues)[number];

export const partnerStatusOptions: {
  label: string;
  value: PartnerStatus;
  color: "neutral" | "warning" | "success";
}[] = [
  { label: "Prospecto", value: "prospect", color: "neutral" },
  { label: "Contactado", value: "contacted", color: "warning" },
  { label: "Aliado", value: "partner", color: "success" },
];
