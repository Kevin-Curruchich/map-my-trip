import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base";
import type { Database } from "~/database.types";
import type { UserProfile } from "~/types/domain";

export class UserRepository extends BaseRepository<UserProfile> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "user_profiles");
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw this.handleError(error);
    }
    return data as UserProfile;
  }

  async findByExternalId(externalAuthId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("user_profiles")
      .select("*")
      .eq("external_auth_id", externalAuthId)
      .single();

    if (error) {
      throw this.handleError(error);
    }
    return data as UserProfile;
  }

  async findWithTierInfo(userId: string): Promise<any> {
    const { data, error } = await this.client
      .from("user_profiles")
      .select(
        `
        *,
        user_tier:user_tiers(*)
      `
      )
      .eq("id", userId)
      .single();

    if (error) throw this.handleError(error);
    return data;
  }
}
