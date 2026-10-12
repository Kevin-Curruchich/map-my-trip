// A place a page can open in the place panel: a Google place id, or the uuid
// of one of our recommended places.
export interface PlaceRef {
  source: "google" | "recommended";
  id: string;
}

export interface PlaceInfo extends PlaceRef {
  name: string;
  address: string | null;
  mapsUrl: string;
  rating: number | null;
  ratingCount: number | null;
  phone: string | null;
  website: string | null;
  // Recommended places only.
  description: string | null;
  instagram: string | null;
  whatsapp: string | null;
  partner: boolean;
  // From Google, when the place is on it.
  openNow: boolean | null;
  // Google's own lines in Spanish, e.g. "lunes: 8:00–17:00".
  weekdayHours: string[];
  photos: { name: string; authors: { name: string; uri: string | null }[] }[];
  reviews: {
    author: string;
    authorUri: string | null;
    authorPhoto: string | null;
    rating: number;
    text: string;
    when: string;
  }[];
  // Shows the "Google Maps" attribution.
  fromGoogle: boolean;
}
