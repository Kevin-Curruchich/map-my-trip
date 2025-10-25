export interface TripExample {
  title: string;
  description: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  itinerary: ItineraryDay[];
  activitiesWithPlaces?: ActivityWithPlace[];
}

export interface ActivityWithPlace {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface ItineraryDay {
  day: number;
  activities: Activity[];
}

export interface Activity {
  id: number;
  name: string;
  activityType: ActivityType;
  location: string;
  placeId?: string; // Add placeId for frontend integration
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
