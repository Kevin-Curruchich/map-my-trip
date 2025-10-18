export interface TripExample {
  title: string;
  description: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  itinerary: ItineraryDay[];
}

export interface ItineraryDay {
  day: number;
  activities: Activity[];
}

export interface Activity {
  name: string;
  activityType: ActivityType;
}

export enum ActivityType {
  Eat = "eat",
  Shop = "shop",
  Visit = "visit",
  Exercise = "exercise",
  Relax = "relax",
  Explore = "explore",
  Learn = "learn",
}
