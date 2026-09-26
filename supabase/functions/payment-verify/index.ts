import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const FLW_SECRET_KEY = Deno.env.get("FLW_SECRET_KEY");

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

    if (!FLW_SECRET_KEY) return new Response(JSON.stringify({ error: "Payment system not configured" }), { status: 503, headers: corsHeaders });

    const { tx_ref } = await req.json();
    if (!tx_ref) return new Response(JSON.stringify({ error: "Missing tx_ref" }), { status: 400, headers: corsHeaders });

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_reference", tx_ref)
      .single();
    if (paymentError || !payment) return new Response(JSON.stringify({ error: "Payment record not found" }), { status: 404, headers: corsHeaders });

    if (payment.status === "successful") {
      const { data: order } = await supabase.from("orders").select("id").eq("id", payment.order_id).single();
      return new Response(JSON.stringify({ success: true, order_id: order?.id, status: "successful" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify with Flutterwave (payment.amount = NGN)
    const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`, {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}`, "Content-Type": "application/json" },
    });
    const flwData = await flwResponse.json();
    console.log("FLW verify response:", JSON.stringify(flwData));

    if (!flwResponse.ok || flwData.status !== "success" || !flwData.data) {
      await supabase.from("payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.id);
      await supabase.from("orders").update({ payment_status: "failed", status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.order_id);
      return new Response(JSON.stringify({ success: false, error: "Payment verification failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const txData = flwData.data;
    // Verify amount in NGN (1% tolerance) and currency
    const isSuccessful =
      txData.status === "successful" &&
      Number(txData.amount) >= Number(payment.amount) * 0.99 &&
      txData.currency === "NGN";

    if (!isSuccessful) {
      console.error("payment-verify: amount/status mismatch", { txData_amount: txData.amount, payment_amount: payment.amount, txData_currency: txData.currency });
      await supabase.from("payments").update({ status: "failed", verification_metadata: txData, updated_at: new Date().toISOString() }).eq("id", payment.id);
      await supabase.from("orders").update({ payment_status: "failed", status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.order_id);
      return new Response(JSON.stringify({ success: false, error: "Payment amount or status mismatch" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("payments").update({
      status: "successful",
      flw_transaction_id: String(txData.id),
      payment_type: txData.payment_type,
      verification_metadata: txData,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", payment.id);

    await supabase.from("orders").update({
      payment_status: "successful",
      status: "completed",
      updated_at: new Date().toISOString(),
    }).eq("id", payment.order_id);

    const { data: order } = await supabase.from("orders").select("*").eq("id", payment.order_id).single();
    if (order) {
      if (order.order_type !== "rental") {
        await supabase.from("deliveries").upsert({
          order_id: order.id,
          user_id: user.id,
          product_id: order.product_id || null,
          delivery_type: order.fulfillment_type || "manual",
          is_unlocked: order.fulfillment_type === "automatic",
          unlocked_at: order.fulfillment_type === "automatic" ? new Date().toISOString() : null,
        }, { onConflict: "order_id" });

        await supabase.from("user_library").upsert({
          user_id: user.id,
          order_id: order.id,
          product_id: order.product_id || null,
          domain_name: order.domain_name || null,
          domain_extension_id: order.domain_extension_id || null,
          purchase_type: order.order_type,
          purchased_at: new Date().toISOString(),
        }, { onConflict: "user_id, order_id" });

        if (order.product_id) {
          await supabase.rpc("increment_purchase_count", { p_id: order.product_id }).catch(() => null);
        }
      } else {
        // Rental: mark subscription payment successful
        await supabase.from("rental_subscriptions")
          .update({ payment_status: "successful", updated_at: new Date().toISOString() })
          .eq("order_id", order.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, order_id: payment.order_id, status: "successful" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("payment-verify error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
