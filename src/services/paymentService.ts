import { supabase } from "@/lib/supabase";
import type { PaymentInitPayload, PaymentInitResponse, Payment } from "@/types";
import { FunctionsHttpError } from "@supabase/supabase-js";

export async function initializePayment(payload: PaymentInitPayload): Promise<PaymentInitResponse> {
  const { data, error } = await supabase.functions.invoke("payment-init", {
    body: payload,
  });

  if (error) {
    let errorMessage = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const text = await error.context?.text();
        errorMessage = text || error.message;
      } catch {
        // keep original
      }
    }
    return { success: false, error: errorMessage };
  }

  return data as PaymentInitResponse;
}

export async function verifyPayment(txRef: string): Promise<{
  success: boolean;
  order_id?: string;
  status?: string;
  error?: string;
}> {
  const { data, error } = await supabase.functions.invoke("payment-verify", {
    body: { tx_ref: txRef },
  });

  if (error) {
    let errorMessage = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const text = await error.context?.text();
        errorMessage = text || error.message;
      } catch {
        // keep original
      }
    }
    return { success: false, error: errorMessage };
  }

  return data as { success: boolean; order_id?: string; status?: string; error?: string };
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function adminGetPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}
