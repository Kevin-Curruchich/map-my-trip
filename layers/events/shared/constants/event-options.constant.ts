export interface BudgetOption {
  label: string;
  value: "low" | "medium" | "high";
  icon: string;
}

export const eventBudgetOptions: BudgetOption[] = [
  { label: "Económico", value: "low", icon: "i-lucide-circle-dollar-sign" },
  { label: "Normal", value: "medium", icon: "i-lucide-banknote" },
  { label: "Sin límite", value: "high", icon: "i-lucide-sparkles" },
];

export const eventBudgetValues = ["low", "medium", "high"] as const;
