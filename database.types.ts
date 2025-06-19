export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  map_my_trip_db: {
    Tables: {
      activity_types: {
        Row: {
          category: string | null
          color_code: string | null
          created_at: string | null
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          api_provider: string | null
          completion_tokens: number | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          prompt_tokens: number | null
          request_data: Json | null
          request_type: string
          response_data: Json | null
          total_tokens: number | null
          trip_id: string | null
          user_id: string | null
        }
        Insert: {
          api_provider?: string | null
          completion_tokens?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          prompt_tokens?: number | null
          request_data?: Json | null
          request_type: string
          response_data?: Json | null
          total_tokens?: number | null
          trip_id?: string | null
          user_id?: string | null
        }
        Update: {
          api_provider?: string | null
          completion_tokens?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          prompt_tokens?: number | null
          request_data?: Json | null
          request_type?: string
          response_data?: Json | null
          total_tokens?: number | null
          trip_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      difficulty_levels: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string | null
          cached_at: string | null
          created_at: string | null
          google_place_id: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          phone_number: string | null
          photos: Json | null
          place_type: string | null
          price_level: number | null
          rating: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cached_at?: string | null
          created_at?: string | null
          google_place_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          phone_number?: string | null
          photos?: Json | null
          place_type?: string | null
          price_level?: number | null
          rating?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cached_at?: string | null
          created_at?: string | null
          google_place_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          phone_number?: string | null
          photos?: Json | null
          place_type?: string | null
          price_level?: number | null
          rating?: number | null
          website?: string | null
        }
        Relationships: []
      }
      trip_activities: {
        Row: {
          activity_type_id: string | null
          created_at: string | null
          custom_location: string | null
          description: string | null
          end_time: string | null
          estimated_cost: number | null
          estimated_duration: number | null
          id: string
          is_ai_generated: boolean | null
          notes: string | null
          order_index: number
          place_id: string | null
          start_time: string | null
          title: string
          trip_day_id: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type_id?: string | null
          created_at?: string | null
          custom_location?: string | null
          description?: string | null
          end_time?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          id?: string
          is_ai_generated?: boolean | null
          notes?: string | null
          order_index: number
          place_id?: string | null
          start_time?: string | null
          title: string
          trip_day_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type_id?: string | null
          created_at?: string | null
          custom_location?: string | null
          description?: string | null
          end_time?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          id?: string
          is_ai_generated?: boolean | null
          notes?: string | null
          order_index?: number
          place_id?: string | null
          start_time?: string | null
          title?: string
          trip_day_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_activities_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_activities_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_activities_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_collaborators: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          role: string | null
          trip_id: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: string | null
          trip_id?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: string | null
          trip_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_collaborators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_collaborators_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_days: {
        Row: {
          created_at: string | null
          date: string | null
          day_number: number
          id: string
          notes: string | null
          title: string | null
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          day_number: number
          id?: string
          notes?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          day_number?: number
          id?: string
          notes?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_reviews: {
        Row: {
          created_at: string | null
          id: string
          rating: number | null
          review_text: string | null
          trip_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_routes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          route_data: Json | null
          total_distance: number | null
          total_duration: number | null
          transportation_mode: string | null
          trip_id: string | null
          updated_at: string | null
          waypoints: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          route_data?: Json | null
          total_distance?: number | null
          total_duration?: number | null
          transportation_mode?: string | null
          trip_id?: string | null
          updated_at?: string | null
          waypoints?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          route_data?: Json | null
          total_distance?: number | null
          total_duration?: number | null
          transportation_mode?: string | null
          trip_id?: string | null
          updated_at?: string | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_routes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_routes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty_level_id: string | null
          duration_days: number | null
          estimated_budget: number | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          tags: string[] | null
          template_category: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level_id?: string | null
          duration_days?: number | null
          estimated_budget?: number | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          tags?: string[] | null
          template_category?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level_id?: string | null
          duration_days?: number | null
          estimated_budget?: number | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          tags?: string[] | null
          template_category?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_difficulty_level_id_fkey"
            columns: ["difficulty_level_id"]
            isOneToOne: false
            referencedRelation: "difficulty_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          trip_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          trip_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          trip_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          created_at: string | null
          current_month_cost: number | null
          email: string
          external_auth_id: string | null
          id: string
          last_reset_date: string | null
          monthly_ai_requests_used: number | null
          name: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          total_api_cost: number | null
          updated_at: string | null
          user_tier_id: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          current_month_cost?: number | null
          email: string
          external_auth_id?: string | null
          id?: string
          last_reset_date?: string | null
          monthly_ai_requests_used?: number | null
          name?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          total_api_cost?: number | null
          updated_at?: string | null
          user_tier_id?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          current_month_cost?: number | null
          email?: string
          external_auth_id?: string | null
          id?: string
          last_reset_date?: string | null
          monthly_ai_requests_used?: number | null
          name?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          total_api_cost?: number | null
          updated_at?: string | null
          user_tier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_tier_id_fkey"
            columns: ["user_tier_id"]
            isOneToOne: false
            referencedRelation: "user_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tiers: {
        Row: {
          can_access_premium_templates: boolean | null
          can_create_public_templates: boolean | null
          created_at: string | null
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_collaborators_per_trip: number | null
          max_trips: number | null
          monthly_ai_requests: number
          monthly_cost: number | null
          name: string
          priority_support: boolean | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          can_access_premium_templates?: boolean | null
          can_create_public_templates?: boolean | null
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_collaborators_per_trip?: number | null
          max_trips?: number | null
          monthly_ai_requests?: number
          monthly_cost?: number | null
          name: string
          priority_support?: boolean | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          can_access_premium_templates?: boolean | null
          can_create_public_templates?: boolean | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_collaborators_per_trip?: number | null
          max_trips?: number | null
          monthly_ai_requests?: number
          monthly_cost?: number | null
          name?: string
          priority_support?: boolean | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_make_ai_request: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      reset_monthly_ai_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  map_my_trip_db: {
    Enums: {},
  },
} as const
