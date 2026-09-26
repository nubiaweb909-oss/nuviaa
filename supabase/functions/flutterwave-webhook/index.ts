import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const FLW_SECRET_KEY = Deno.env.get("FLW_SECRET_KEY");
const FLW_WEBHOOK_SECRET = Deno.env.get("FLW_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const secretHash = req.headers.get("verif-hash");
    if (!FLW_WEBHOOK_SECRET || secretHash !== FLW_WEBHOOK_SECRET) {
      console.error("Webhook: Invalid signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload).slice(0, 500));

    if (payload.event !== "charge.completed") return new Response("OK", { status: 200 });

    const txData = payload.data;
    if (!txData || txData.status !== "successful") return new Response("OK", { status: 200 });

    const txRef = txData.tx_ref;
    if (!txRef) return new Response("OK", { status: 200 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_reference", txRef)
      .single();

    if (!payment) { console.error("Webhook: Payment not found:", txRef); return new Response("Not Found", { status: 404 }); }
    if (payment.status === "successful") { console.log("Webhook: Already processed:", txRef); return new Response("OK", { status: 200 }); }

    // Verify with FLW API
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${txData.id}/verify`, {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
    });
    const verifyData = await verifyRes.json();

    if (verifyData.status !== "success" || verifyData.data?.status !== "successful") {
      await supabase.from("payments").update({ status: "failed", webhook_received_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", payment.id);
      return new Response("OK", { status: 200 });
    }

    const vd = verifyData.data;
    // Verify NGN amount (payments table stores NGN)
    const amountMatch = Number(vd.amount) >= Number(payment.amount) * 0.99; // 1% tolerance
    const currencyMatch = vd.currency === "NGN";

    if (!amountMatch || !currencyMatch) {
      console.error("Webhook: Amount/currency mismatch", { vd_amount: vd.amount, expected: payment.amount, vd_currency: vd.currency });
      await supabase.from("payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.id);
      return new Response("OK", { status: 200 });
    }

    await supabase.from("payments").update({
      status: "successful",
      flw_transaction_id: String(vd.id),
      payment_type: vd.payment_type,
      verification_metadata: vd,
      webhook_received_at: new Date().toISOString(),
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
          user_id: order.user_id,
          product_id: order.product_id || null,
          delivery_type: order.fulfillment_type || "manual",
          is_unlocked: order.fulfillment_type === "automatic",
          unlocked_at: order.fulfillment_type === "automatic" ? new Date().toISOString() : null,
        }, { onConflict: "order_id" });

        await supabase.from("user_library").upsert({
          user_id: order.user_id,
          order_id: order.id,
          product_id: order.product_id || null,
          domain_name: order.domain_name || null,
          domain_extension_id: order.domain_extension_id || null,
          purchase_type: order.order_type,
          purchased_at: new Date().toISOString(),
        }, { onConflict: "user_id, order_id" });
      } else {
        // Rental: update subscription payment_status
        await supabase.from("rental_subscriptions")
          .update({ payment_status: "successful", updated_at: new Date().toISOString() })
          .eq("order_id", order.id);
      }
    }

    console.log("Webhook: Processed:", txRef);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
