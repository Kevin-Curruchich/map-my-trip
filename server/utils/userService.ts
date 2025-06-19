import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/database.types";

export const createServerUserService = () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_KEY || "",
    {
      db: {
        schema: "map_my_trip_db",
      },
    }
  );

  return {
    async findByExternalId(externalAuthId: string) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email, name, avatar_url")
        .eq("external_auth_id", externalAuthId)
        .single();

      if (error) return null;
      return data;
    },

    async findGetFreeTier() {
      const { data, error } = await supabase
        .from("user_tiers")
        .select("*")
        .eq("slug", "free")
        .single();

      if (error) return null;
      return data;
    },

    async createUserProfile({
      email,
      name,
      externalAuthId,
      authProvider,
      avatarUrl,
      userTierId,
    }: {
      email: string;
      name: string;
      externalAuthId: string;
      authProvider: string;
      avatarUrl?: string;
      userTierId?: string;
    }) {
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          email,
          name,
          external_auth_id: externalAuthId,
          auth_provider: authProvider,
          avatar_url: avatarUrl || "",
          user_tier_id: userTierId,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  };
};
