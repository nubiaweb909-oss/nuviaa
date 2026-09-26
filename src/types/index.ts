export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductFeature {
  id: string;
  product_id: string;
  feature: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  product_type: "website" | "app";
  price: number;
  currency: string;
  overview?: string;
  description?: string;
  demo_url?: string;
  video_url?: string;
  is_featured: boolean;
  is_published: boolean;
  primary_image_url?: string;
  average_rating: number;
  review_count: number;
  purchase_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  features?: ProductFeature[];
}

export interface DomainExtension {
  id: string;
  extension: string;
  price: number;
  currency: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DomainResult {
  extension: DomainExtension;
  fullDomain: string;
  domainName: string;
}

export interface Order {
  id: string;
  order_reference: string;
  user_id: string;
  order_type: "product" | "domain";
  product_id?: string;
  domain_name?: string;
  domain_extension_id?: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
  payment_status: "pending" | "successful" | "failed" | "cancelled" | "refunded";
  delivery_status: "pending" | "processing" | "delivered" | "failed";
  fulfillment_type: "automatic" | "manual";
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  domain_extension?: DomainExtension;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  provider: string;
  transaction_reference: string;
  flw_transaction_id?: string;
  amount: number;
  currency: string;
  status: "pending" | "successful" | "failed" | "cancelled" | "refunded";
  payment_type?: string;
  verification_metadata?: Record<string, unknown>;
  webhook_received_at?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  user_id: string;
  product_id?: string;
  delivery_type: "automatic" | "manual";
  file_url?: string;
  download_url?: string;
  instructions?: string;
  is_unlocked: boolean;
  unlocked_at?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  profile?: Pick<Profile, "full_name" | "username" | "avatar_url">;
}

export interface UserLibraryItem {
  id: string;
  user_id: string;
  order_id: string;
  product_id?: string;
  domain_name?: string;
  domain_extension_id?: string;
  purchase_type: "product" | "domain";
  purchased_at: string;
  product?: Product;
  domain_extension?: DomainExtension;
  order?: Order;
  delivery?: Delivery;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: string;
  description?: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  currency: string;
  currency_symbol: string;
  whatsapp_url: string;
  telegram_url: string;
  support_email: string;
  flw_configured: boolean;
}

// ─── Rental Types ─────────────────────────────────────────────────────────────

export type RentalPlan = "1month" | "3months" | "1year";

export interface RentalProduct {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  product_type: "website" | "app";
  overview?: string;
  description?: string;
  demo_url?: string;
  video_url?: string;
  price_1month: number;
  price_3months: number;
  price_1year: number;
  currency: string;
  is_featured: boolean;
  is_published: boolean;
  primary_image_url?: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: RentalProductImage[];
  features?: RentalProductFeature[];
}

export interface RentalProductImage {
  id: string;
  rental_product_id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface RentalProductFeature {
  id: string;
  rental_product_id: string;
  feature: string;
  sort_order: number;
}

export interface RentalSubscription {
  id: string;
  order_id?: string;
  user_id: string;
  rental_product_id: string;
  plan: RentalPlan;
  usd_price: number;
  ngn_price: number;
  exchange_rate: number;
  status: "pending" | "active" | "expired" | "cancelled" | "suspended";
  access_url?: string;
  access_notes?: string;
  start_date?: string;
  end_date?: string;
  payment_status: "pending" | "successful" | "failed";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  rental_product?: RentalProduct;
  order?: Order;
}

export interface AdminStats {
  total_users: number;
  total_products: number;
  total_websites: number;
  total_apps: number;
  total_domains_sold: number;
  total_orders: number;
  pending_fulfillment: number;
  successful_payments: number;
  failed_payments: number;
  verified_revenue: number;
}

export interface PaymentInitPayload {
  product_id?: string;
  domain_name?: string;
  domain_extension_id?: string;
  rental_product_id?: string;
  rental_plan?: RentalPlan;
  order_type: "product" | "domain" | "rental";
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  // Optional domain add-on for website full ownership purchase
  addon_domain_name?: string;
  addon_domain_extension_id?: string;
}

// Note: usd_ngn_rate removed — Nuvia is NGN-only.

export interface PaymentInitResponse {
  success: boolean;
  payment_link?: string;
  tx_ref?: string;
  amount?: number;
  currency?: string;
  public_key?: string;
  error?: string;
}

export interface SeedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  product_type: "website" | "app";
  price: number;
  currency: string;
  overview: string;
  description: string;
  demo_url?: string;
  is_featured: boolean;
  is_published: boolean;
  primary_image_url: string;
  images: string[];
  features: string[];
  average_rating: number;
  review_count: number;
}
