import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const FLW_SECRET_KEY = Deno.env.get("FLW_SECRET_KEY");
const FLW_PUBLIC_KEY = Deno.env.get("FLW_PUBLIC_KEY");

function generateTxRef(): string {
  return `NVP-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

function generateOrderRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NV-${ts}-${rand}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    if (!FLW_SECRET_KEY || !FLW_PUBLIC_KEY) {
      return new Response(
        JSON.stringify({ error: "Payment system not yet configured. Please contact support." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      order_type,
      product_id,
      domain_name,
      domain_extension_id,
      rental_product_id,
      rental_plan,
      customer_name,
      customer_email,
      customer_phone,
      // Optional domain add-on for website full ownership purchases
      addon_domain_name,
      addon_domain_extension_id,
    } = body;

    // ── Fetch item details and compute NGN amount directly ──────────────────
    let ngnAmount = 0;
    let itemName = "";
    let fulfillmentType = "manual";
    let rentalProductId: string | null = null;
    let planKey: string | null = null;

    if (order_type === "product" && product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("name, price, is_published")
        .eq("id", product_id)
        .single();
      if (!product || !product.is_published)
        return new Response(JSON.stringify({ error: "Product not found or unavailable" }), { status: 404, headers: corsHeaders });
      ngnAmount = Number(product.price);
      itemName = product.name;

      // Optional domain add-on (website full-ownership checkout)
      if (addon_domain_extension_id && addon_domain_name) {
        const { data: addonExt } = await supabase
          .from("domain_extensions")
          .select("extension, price, is_active")
          .eq("id", addon_domain_extension_id)
          .single();
        if (addonExt && addonExt.is_active) {
          ngnAmount += Number(addonExt.price);
          itemName += ` + ${addon_domain_name}${addonExt.extension}`;
        }
      }
    } else if (order_type === "domain" && domain_extension_id) {
      const { data: ext } = await supabase
        .from("domain_extensions")
        .select("extension, price, is_active")
        .eq("id", domain_extension_id)
        .single();
      if (!ext || !ext.is_active)
        return new Response(JSON.stringify({ error: "Domain extension not available" }), { status: 404, headers: corsHeaders });
      ngnAmount = Number(ext.price);
      itemName = `${domain_name}${ext.extension}`;
    } else if (order_type === "rental" && rental_product_id && rental_plan) {
      const priceMap: Record<string, string> = {
        "1month": "price_1month",
        "3months": "price_3months",
        "1year": "price_1year",
      };
      const priceCol = priceMap[rental_plan];
      if (!priceCol)
        return new Response(JSON.stringify({ error: "Invalid rental plan" }), { status: 400, headers: corsHeaders });
      const { data: rp } = await supabase
        .from("rental_products")
        .select(`name, ${priceCol}, is_published`)
        .eq("id", rental_product_id)
        .single();
      if (!rp || !rp.is_published)
        return new Response(JSON.stringify({ error: "Rental product not found or unavailable" }), { status: 404, headers: corsHeaders });
      ngnAmount = Number(rp[priceCol]);
      itemName = `${rp.name} (${rental_plan === "1month" ? "1 Month" : rental_plan === "3months" ? "3 Months" : "1 Year"} Rental)`;
      rentalProductId = rental_product_id;
      planKey = rental_plan;
    } else {
      return new Response(JSON.stringify({ error: "Invalid order details" }), { status: 400, headers: corsHeaders });
    }

    // ── Validate user profile ────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    if (!profile) return new Response(JSON.stringify({ error: "User profile not found" }), { status: 404, headers: corsHeaders });

    const txRef = generateTxRef();
    const orderRef = generateOrderRef();

    // ── Create order (amount = NGN directly) ────────────────────────────────
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      order_reference: orderRef,
      user_id: user.id,
      order_type,
      product_id: product_id || null,
      domain_name: order_type === "domain" ? domain_name || null : (addon_domain_name || null),
      domain_extension_id: order_type === "domain" ? domain_extension_id || null : (addon_domain_extension_id || null),
      amount: ngnAmount,
      currency: "NGN",
      fulfillment_type: fulfillmentType,
    }).select().single();

    if (orderError) throw new Error(orderError.message);

    // ── Create payment record ────────────────────────────────────────────────
    await supabase.from("payments").insert({
      order_id: order.id,
      user_id: user.id,
      provider: "flutterwave",
      transaction_reference: txRef,
      amount: ngnAmount,
      currency: "NGN",
      status: "pending",
    });

    // ── Create pending rental subscription if rental order ─────────────────
    if (order_type === "rental" && rentalProductId && planKey) {
      await supabase.from("rental_subscriptions").insert({
        order_id: order.id,
        user_id: user.id,
        rental_product_id: rentalProductId,
        plan: planKey,
        usd_price: ngnAmount,    // stored as NGN price in this field now (legacy column name)
        ngn_price: ngnAmount,
        exchange_rate: 1,        // 1:1 — no conversion
        status: "pending",
        payment_status: "pending",
      });
    }

    // ── Build callback URL ────────────────────────────────────────────────────
    const origin = req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://nuvia.store";
    const callbackUrl = `${origin}/payment/callback`;

    console.log(`payment-init: order=${order.id} ngn=${ngnAmount}`);

    return new Response(
      JSON.stringify({
        success: true,
        tx_ref: txRef,
        amount: ngnAmount,
        currency: "NGN",
        public_key: FLW_PUBLIC_KEY,
        order_id: order.id,
        item_name: itemName,
        callback_url: callbackUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("payment-init error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
