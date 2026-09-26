import { supabase } from "@/lib/supabase";
import type { ProductReview } from "@/types";

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, profile:user_profiles(full_name, username, avatar_url)")
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as ProductReview[];
}

export async function createReview(review: {
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
}): Promise<ProductReview> {
  const { data, error } = await supabase.from("product_reviews").insert(review).select().single();
  if (error) throw error;
  return data as ProductReview;
}

export async function hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("payment_status", "successful")
    .limit(1);
  return !!(data && data.length > 0);
}

export async function adminGetReviews(): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, profile:user_profiles(full_name, username), product:products(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ProductReview[];
}

export async function adminUpdateReview(id: string, updates: Partial<ProductReview>): Promise<void> {
  const { error } = await supabase
    .from("product_reviews")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function adminDeleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("product_reviews").delete().eq("id", id);
  if (error) throw error;
}
