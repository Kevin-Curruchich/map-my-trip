import type { Database } from "~/database.types";

export type Trip = Database["map_my_trip_db"]["Tables"]["trips"]["Row"];
export type Collaborator =
  Database["map_my_trip_db"]["Tables"]["trip_collaborators"]["Row"];
export type UserProfile =
  Database["map_my_trip_db"]["Tables"]["user_profiles"]["Row"];
export type UserTier =
  Database["map_my_trip_db"]["Tables"]["user_tiers"]["Row"];

// Create types for requests
export type CreateUserRequest =
  Database["map_my_trip_db"]["Tables"]["user_profiles"]["Insert"];
export type UpdateUserRequest =
  Database["map_my_trip_db"]["Tables"]["user_profiles"]["Update"];
