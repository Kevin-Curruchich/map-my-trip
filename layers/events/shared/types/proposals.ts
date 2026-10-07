// A real place a proposal step happens at, from Google Places or from our own
// recommendations (places that are often missing from Google).
export interface StepPlace {
  source: "google" | "recommended";
  // Google place id, or the recommended place's uuid.
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string;
  rating: number | null;
  ratingCount: number | null;
  priceLevel: "low" | "medium" | "high" | null;
  // Recommended places only: why we recommend it, and where to follow it.
  description: string | null;
  instagram: string | null;
  // Paying partner: preferred when it fits, and always labeled as such.
  partner: boolean;
}

export interface ProposalStep {
  // What happens in this step, e.g. "Desayuno con vista al volcán".
  title: string;
  place: StepPlace | null;
}

// Proposals created before places were added stored plain strings.
export type StoredProposalStep = ProposalStep | string;
