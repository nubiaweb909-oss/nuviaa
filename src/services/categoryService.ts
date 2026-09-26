import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";
import { SEED_CATEGORIES } from "@/constants/seedData";

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error || !data?.length) return seedCategories();
    return data as Category[];
  } catch {
    return seedCategories();
  }
}

export async function adminGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as Category[];
}

export async function adminCreateCategory(cat: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase.from("categories").insert(cat).select().single();
  if (error) throw error;
  return data as Category;
}

export async function adminUpdateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

function seedCategories(): Category[] {
  return SEED_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
