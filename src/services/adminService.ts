import { supabase } from "@/lib/supabase";
import type { AdminStats, Profile, ProductImage } from "@/types";

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [users, products, orders, payments] = await Promise.all([
      supabase.from("user_profiles").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id,product_type", { count: "exact" }),
      supabase.from("orders").select("id,status,payment_status,delivery_status,order_type"),
      supabase.from("payments").select("status,amount"),
    ]);

    const productData = products.data ?? [];
    const orderData = orders.data ?? [];
    const paymentData = payments.data ?? [];

    const totalWebsites = productData.filter((p) => p.product_type === "website").length;
    const totalApps = productData.filter((p) => p.product_type === "app").length;
    const totalDomainsSold = orderData.filter((o) => o.order_type === "domain" && o.payment_status === "successful").length;
    const successfulPayments = paymentData.filter((p) => p.status === "successful").length;
    const failedPayments = paymentData.filter((p) => p.status === "failed").length;
    const pendingFulfillment = orderData.filter((o) => o.payment_status === "successful" && o.delivery_status === "pending").length;
    const verifiedRevenue = paymentData
      .filter((p) => p.status === "successful")
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);

    return {
      total_users: users.count ?? 0,
      total_products: products.count ?? 0,
      total_websites: totalWebsites,
      total_apps: totalApps,
      total_domains_sold: totalDomainsSold,
      total_orders: orderData.length,
      pending_fulfillment: pendingFulfillment,
      successful_payments: successfulPayments,
      failed_payments: failedPayments,
      verified_revenue: verifiedRevenue,
    };
  } catch {
    return {
      total_users: 0,
      total_products: 0,
      total_websites: 0,
      total_apps: 0,
      total_domains_sold: 0,
      total_orders: 0,
      pending_fulfillment: 0,
      successful_payments: 0,
      failed_payments: 0,
      verified_revenue: 0,
    };
  }
}

export async function adminGetUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,email,full_name,username,phone,is_admin,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function adminToggleUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function adminUpsertProductImages(
  productId: string,
  images: Partial<ProductImage & { product_id: string }>[]
): Promise<void> {
  // Delete all existing images for this product and re-insert
  // This is simpler and avoids complex diff logic
  const { error: delError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (delError) throw delError;

  if (images.length === 0) return;

  const rows = images.map((img, i) => ({
    product_id: productId,
    url: img.url,
    alt_text: img.alt_text || "",
    sort_order: i,
    is_primary: img.is_primary ?? (i === 0),
  }));

  const { error } = await supabase.from("product_images").insert(rows);
  if (error) throw error;
}

export async function adminDeleteProductImage(imageId: string, imageUrl: string): Promise<void> {
  // Delete from storage
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/product-images/");
    if (parts.length > 1) {
      await supabase.storage.from("product-images").remove([decodeURIComponent(parts[1])]);
    }
  } catch {
    // Storage delete is best-effort
  }
  // Delete from DB
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
}
