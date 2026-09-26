import { supabase } from "@/lib/supabase";
import type { RentalProduct, RentalProductImage, RentalProductFeature, RentalSubscription, RentalPlan } from "@/types";

// ─── Public queries ──────────────────────────────────────────────────────────

export async function getRentalProducts(filters?: {
  product_type?: string;
  search?: string;
  sort?: string;
  limit?: number;
}): Promise<RentalProduct[]> {
  try {
    let query = supabase
      .from("rental_products")
      .select("*, category:categories(id,name,slug)")
      .eq("is_published", true);

    if (filters?.product_type) query = query.eq("product_type", filters.product_type);
    if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

    if (filters?.sort === "price_asc") query = query.order("price_1month", { ascending: true });
    else if (filters?.sort === "price_desc") query = query.order("price_1month", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) { console.error("[Nuvia] getRentalProducts:", error.message); return []; }
    return (data ?? []) as RentalProduct[];
  } catch (err) {
    console.error("[Nuvia] getRentalProducts exception:", err);
    return [];
  }
}

export async function getRentalProductBySlug(slug: string): Promise<RentalProduct | null> {
  try {
    const { data, error } = await supabase
      .from("rental_products")
      .select("*, category:categories(id,name,slug), images:rental_product_images(*), features:rental_product_features(*)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
    if (error || !data) return null;
    return data as RentalProduct;
  } catch { return null; }
}

export async function getRentalProductById(id: string): Promise<RentalProduct | null> {
  try {
    const { data, error } = await supabase
      .from("rental_products")
      .select("*, category:categories(id,name,slug), images:rental_product_images(*), features:rental_product_features(*)")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as RentalProduct;
  } catch { return null; }
}

// ─── Admin queries ───────────────────────────────────────────────────────────

export async function adminGetRentalProducts(): Promise<RentalProduct[]> {
  const { data, error } = await supabase
    .from("rental_products")
    .select("*, category:categories(id,name,slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as RentalProduct[];
}

export async function adminCreateRentalProduct(product: Partial<RentalProduct>): Promise<RentalProduct> {
  const { data, error } = await supabase.from("rental_products").insert(product).select().single();
  if (error) throw error;
  return data as RentalProduct;
}

export async function adminUpdateRentalProduct(id: string, updates: Partial<RentalProduct>): Promise<RentalProduct> {
  const { data, error } = await supabase
    .from("rental_products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as RentalProduct;
}

export async function adminDeleteRentalProduct(id: string): Promise<void> {
  const { error } = await supabase.from("rental_products").delete().eq("id", id);
  if (error) throw error;
}

export async function adminUpsertRentalProductImages(
  rentalProductId: string,
  images: Partial<RentalProductImage>[]
): Promise<void> {
  await supabase.from("rental_product_images").delete().eq("rental_product_id", rentalProductId);
  if (images.length === 0) return;
  const rows = images.map((img, i) => ({
    rental_product_id: rentalProductId,
    url: img.url,
    alt_text: img.alt_text || "",
    sort_order: i,
    is_primary: img.is_primary ?? (i === 0),
  }));
  const { error } = await supabase.from("rental_product_images").insert(rows);
  if (error) throw error;
}

export async function updateRentalProductFeatures(rentalProductId: string, features: string[]): Promise<void> {
  await supabase.from("rental_product_features").delete().eq("rental_product_id", rentalProductId);
  if (features.length === 0) return;
  const rows = features.map((f, i) => ({ rental_product_id: rentalProductId, feature: f, sort_order: i }));
  const { error } = await supabase.from("rental_product_features").insert(rows);
  if (error) throw error;
}

// ─── Subscription queries ────────────────────────────────────────────────────

export async function getUserSubscriptions(userId: string): Promise<RentalSubscription[]> {
  const { data, error } = await supabase
    .from("rental_subscriptions")
    .select("*, rental_product:rental_products(id,name,slug,primary_image_url,product_type,demo_url), order:orders(id,order_reference,payment_status,amount)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as RentalSubscription[];
}

export async function adminGetSubscriptions(): Promise<RentalSubscription[]> {
  const { data, error } = await supabase
    .from("rental_subscriptions")
    .select("*, rental_product:rental_products(id,name,slug), order:orders(id,order_reference,payment_status,amount)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as RentalSubscription[];
}

export async function adminUpdateSubscription(id: string, updates: Partial<RentalSubscription>): Promise<RentalSubscription> {
  const { data, error } = await supabase
    .from("rental_subscriptions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as RentalSubscription;
}

export async function createRentalSubscription(sub: {
  user_id: string;
  rental_product_id: string;
  plan: RentalPlan;
  ngn_price: number;
  order_id?: string;
}): Promise<RentalSubscription> {
  const { data, error } = await supabase
    .from("rental_subscriptions")
    .insert({
      ...sub,
      usd_price: sub.ngn_price,  // legacy column — stores NGN price
      exchange_rate: 1,           // no conversion
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data as RentalSubscription;
}

/** Plan display helpers */
export const PLAN_LABELS: Record<string, string> = {
  "1month": "1 Month",
  "3months": "3 Months",
  "1year": "1 Year",
};

export function getPlanDurationDays(plan: RentalPlan): number {
  if (plan === "1month") return 30;
  if (plan === "3months") return 90;
  return 365;
}
