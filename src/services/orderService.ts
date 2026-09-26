import { supabase } from "@/lib/supabase";
import type { Order, UserLibraryItem, Delivery } from "@/types";
import { generateOrderReference } from "@/lib/utils";

export async function createOrder(order: {
  user_id: string;
  order_type: "product" | "domain";
  product_id?: string;
  domain_name?: string;
  domain_extension_id?: string;
  amount: number;
  currency?: string;
  fulfillment_type?: "automatic" | "manual";
}): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      order_reference: generateOrderReference(),
      currency: order.currency ?? "NGN",
      fulfillment_type: order.fulfillment_type ?? "manual",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, product:products(id,name,slug,primary_image_url,product_type), domain_extension:domain_extensions(id,extension,price)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, product:products(id,name,slug,primary_image_url), domain_extension:domain_extensions(id,extension,price)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getUserLibrary(userId: string): Promise<UserLibraryItem[]> {
  const { data, error } = await supabase
    .from("user_library")
    .select(`*, 
      product:products(id,name,slug,primary_image_url,product_type,demo_url),
      domain_extension:domain_extensions(id,extension,price),
      order:orders(id,order_reference,status,payment_status,delivery_status,amount)
    `)
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });
  if (error) throw error;
  return data as UserLibraryItem[];
}

export async function getDeliveryByOrderId(orderId: string): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("order_id", orderId)
    .single();
  if (error) return null;
  return data as Delivery;
}

export async function adminGetOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      product:products(id,name,slug),
      domain_extension:domain_extensions(id,extension)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function adminUpdateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export async function addToUserLibrary(item: {
  user_id: string;
  order_id: string;
  product_id?: string;
  domain_name?: string;
  domain_extension_id?: string;
  purchase_type: "product" | "domain";
}): Promise<void> {
  const { error } = await supabase.from("user_library").insert(item);
  if (error && !error.message.includes("duplicate")) throw error;
}
