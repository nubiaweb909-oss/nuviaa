import { supabase } from "@/lib/supabase";
import type { Product, ProductImage, ProductFeature } from "@/types";

export async function getProducts(filters?: {
  category_slug?: string;
  product_type?: string;
  is_featured?: boolean;
  search?: string;
  sort?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select("*, category:categories(id,name,slug)")
      .eq("is_published", true);

    if (filters?.category_slug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", filters.category_slug)
        .single();
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (filters?.product_type) query = query.eq("product_type", filters.product_type);
    if (filters?.is_featured) query = query.eq("is_featured", true);
    if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

    if (filters?.sort === "price_asc") query = query.order("price", { ascending: true });
    else if (filters?.sort === "price_desc") query = query.order("price", { ascending: false });
    else if (filters?.sort === "rating") query = query.order("average_rating", { ascending: false });
    else if (filters?.sort === "popular") query = query.order("purchase_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) {
      console.error("[Nuvia] getProducts error:", error.message);
      return [];
    }
    return (data ?? []) as Product[];
  } catch (err) {
    console.error("[Nuvia] getProducts exception:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id,name,slug), images:product_images(*), features:product_features(*)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id,name,slug), images:product_images(*), features:product_features(*)")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
}

// Admin: get all products including unpublished
export async function adminGetProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

/** Admin form payload — demo_url may be explicitly null (field is optional). */
export type AdminProductPayload = Partial<Product> & { demo_url?: string | null };

export async function adminCreateProduct(product: AdminProductPayload): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function adminUpdateProduct(id: string, updates: AdminProductPayload): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function addProductImage(image: Partial<ProductImage>): Promise<ProductImage> {
  const { data, error } = await supabase.from("product_images").insert(image).select().single();
  if (error) throw error;
  return data as ProductImage;
}

export async function deleteProductImage(id: string): Promise<void> {
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProductFeatures(productId: string, features: string[]): Promise<void> {
  await supabase.from("product_features").delete().eq("product_id", productId);
  if (features.length > 0) {
    const rows = features.map((f, i) => ({ product_id: productId, feature: f, sort_order: i }));
    const { error } = await supabase.from("product_features").insert(rows);
    if (error) throw error;
  }
}

// ─── Type guards ──────────────────────────────────────────────────────────────
// Kept for type safety; actual Product type is from @/types
export type { Product, ProductImage, ProductFeature };
