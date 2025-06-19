import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base";
import type { Database } from "~/database.types";
import type { Trip } from "~/types/domain";

export class TripRepository extends BaseRepository<Trip> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "trips");
  }

  async findByUserId(userId: string): Promise<Trip[]> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("creator_id", userId)
      .limit(10)
      .order("created_at", { ascending: false });

    console.log("findByUserId", data, error);

    if (error) throw this.handleError(error);
    return data as Trip[];
  }

  async findPublicTemplates(limit = 20): Promise<Trip[]> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("is_template", true)
      .eq("is_public", true)
      .limit(limit);

    if (error) throw this.handleError(error);
    return data as Trip[];
  }

  async findWithCollaborators(
    tripId: string
  ): Promise<Trip & { collaborators: any[] }> {
    const { data, error } = await this.getTable()
      .select(
        `
        *,
        collaborators:trip_collaborators(
          id,
          role,
          accepted_at,
          user:user_profiles(id, name, email, avatar_url)
        )
      `
      )
      .eq("id", tripId)
      .single();

    if (error) throw this.handleError(error);
    return data as Trip & { collaborators: any[] };
  }
}
