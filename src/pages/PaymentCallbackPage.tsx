import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, MessageCircle, LayoutDashboard } from "lucide-react";
import { verifyPayment } from "@/services/paymentService";
import { getOrderById } from "@/services/orderService";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { WHATSAPP_URL } from "@/constants";

type Status = "verifying" | "success" | "failed" | "cancelled";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const txRef = searchParams.get("tx_ref") || searchParams.get("transaction_id") || "";
  const urlStatus = searchParams.get("status");

  useEffect(() => {
    if (!txRef) {
      setStatus("failed");
      setError("No transaction reference found.");
      return;
    }

    if (urlStatus === "cancelled") {
      setStatus("cancelled");
      return;
    }

    const verify = async () => {
      const result = await verifyPayment(txRef);
      if (result.success && result.order_id) {
        const ord = await getOrderById(result.order_id);
        setOrder(ord);
        setStatus("success");
      } else {
        setError(result.error || "Payment verification failed.");
        setStatus("failed");
      }
    };

    verify();
  }, [txRef, urlStatus]);

  return (
    <div className="min-h-screen bg-nuvia-hero pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {status === "verifying" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-12 text-center light-streak"
          >
            <Loader2 className="w-12 h-12 text-nuvia-ink animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl text-nuvia-ink mb-2">Verifying Payment</h2>
            <p className="text-nuvia-brown text-sm">Please wait while we confirm your transaction with Flutterwave…</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-12 text-center light-streak"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-[#AFC79B]/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-9 h-9 text-nuvia-moss" />
            </motion.div>
            <h2 className="font-display text-3xl text-nuvia-ink mb-3">Payment Confirmed</h2>
            <p className="text-nuvia-brown mb-6">Your payment has been verified and your order is confirmed.</p>

            {order && (
              <div className="glass rounded-2xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-nuvia-brown">Order Reference</span>
                  <span className="font-medium text-nuvia-ink font-mono text-xs">{order.order_reference}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-nuvia-brown">Amount Paid</span>
                  <span className="font-bold text-nuvia-ink">{formatPrice(order.amount, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-nuvia-brown">Fulfillment</span>
                  <span className="capitalize text-nuvia-ink">{order.fulfillment_type}</span>
                </div>
              </div>
            )}

            {order?.fulfillment_type === "manual" && (
              <div className="bg-nuvia-champagne/20 border border-nuvia-champagne/50 rounded-xl p-4 mb-6">
                <p className="text-xs font-medium text-[#7A5A2E] mb-1">Manual Fulfillment Required</p>
                <p className="text-xs text-[#7A5A2E]">Your order requires manual delivery by our team. Please contact us via WhatsApp for a prompt response.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link to="/dashboard/purchases" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                <LayoutDashboard className="w-4 h-4" /> View My Purchases
              </Link>
              {(order?.fulfillment_type === "manual" || order?.order_type === "domain") && (
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
                  <MessageCircle className="w-4 h-4" /> Contact Support on WhatsApp
                </a>
              )}
              <Link to="/marketplace" className="btn-ghost w-full text-sm justify-center">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}

        {(status === "failed" || status === "cancelled") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-12 text-center light-streak"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="font-display text-2xl text-nuvia-ink mb-3">
              {status === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
            </h2>
            <p className="text-nuvia-brown mb-6 text-sm">
              {status === "cancelled"
                ? "You cancelled the payment. No charge has been made."
                : error || "We could not verify your payment. If you were charged, please contact support."}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate(-1)} className="btn-primary w-full py-3.5">
                Try Again
              </button>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
                <MessageCircle className="w-4 h-4" /> Contact Support
              </a>
              <Link to="/" className="btn-ghost w-full text-sm justify-center">Back to Home</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
