export interface TripExample {
  title: string;
  description: string;
}

export interface TripPlace {
  id: string;
  name: string;
  address: string;
}

export interface Activity {
  id: number;
  name: string;
  activityType: ActivityType;
  location: string;
  time: string;
  duration: string;
  notes: string;
  placeId?: string;
}

export interface ActivityWithPlace extends Activity {
  latitude: number;
  longitude: number;
}

export interface ItineraryDay {
  day: number;
  activities: Activity[];
}

export interface GeneratedTrip {
  title: string;
  description: string;
  destination: string;
  itinerary: ItineraryDay[];
}

export interface Trip extends GeneratedTrip {
  id: string;
  activitiesWithPlaces: ActivityWithPlace[];
}
