import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/database.types";

type TableName = keyof Database["map_my_trip_db"]["Tables"];

export abstract class BaseRepository<T> {
  protected client: SupabaseClient<Database>;
  protected tableName: TableName;
  protected readonly schema = "map_my_trip_db";

  constructor(client: SupabaseClient<Database>, tableName: TableName) {
    this.client = client;
    this.tableName = tableName;
  }

  // Helper to ensure schema is always used
  protected getTable() {
    return this.client.schema(this.schema).from(this.tableName);
  }

  //Common CRUD operations
  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw this.handleError(error);
    }
    return data as T;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await this.getTable().select("*");

    if (error) {
      throw this.handleError(error);
    }
    return data as T[];
  }

  async create(item: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
    const { data, error } = await this.getTable()
      .insert(item)
      .select("*")
      .single();

    if (error) {
      throw this.handleError(error);
    }
    return data as T;
  }

  async update(
    id: string,
    item: Partial<Omit<T, "id" | "created_at" | "updated_at">>
  ): Promise<T | null> {
    const { data, error } = await this.getTable()
      .update(item)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw this.handleError(error);
    }
    return data as T | null;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.getTable().delete().eq("id", id);

    if (error) {
      throw this.handleError(error);
    }
  }

  protected handleError(error: any): Error {
    console.error(`${this.tableName} Repository Error:`, error);
    return new Error(`Database operation failed: ${error.message}`);
  }
}
