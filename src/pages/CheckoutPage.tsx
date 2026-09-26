import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Lock, MessageCircle, AlertCircle, Loader2, RefreshCw, Globe, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getProductById } from "@/services/productService";
import { getRentalProductById, PLAN_LABELS } from "@/services/rentalService";
import { getDomainExtensionById, getDomainExtensions } from "@/services/domainService";
import { initializePayment } from "@/services/paymentService";
import { useSettings } from "@/hooks/useSettings";
import type { Product, DomainExtension, RentalProduct, RentalPlan } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

declare global {
  interface Window {
    FlutterwaveCheckout: (options: Record<string, unknown>) => void;
  }
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();

  const orderType = (searchParams.get("type") || "product") as "product" | "domain" | "rental";
  const productId = searchParams.get("product_id") || "";
  const rentalProductId = searchParams.get("rental_product_id") || "";
  const rentalPlan = (searchParams.get("rental_plan") || "1month") as RentalPlan;
  const domainName = searchParams.get("domain") || "";
  const extensionId = searchParams.get("extension_id") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [rentalProduct, setRentalProduct] = useState<RentalProduct | null>(null);
  const [extension, setExtension] = useState<DomainExtension | null>(null);
  const [domainExtensions, setDomainExtensions] = useState<DomainExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Domain add-on (Full Ownership website only)
  const [addDomain, setAddDomain] = useState(false);
  const [addonDomainName, setAddonDomainName] = useState("");
  const [addonExtensionId, setAddonExtensionId] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const load = async () => {
      if (orderType === "product" && productId) {
        const [p, exts] = await Promise.all([
          getProductById(productId),
          getDomainExtensions(),
        ]);
        setProduct(p);
        setDomainExtensions(exts);
        if (exts.length > 0) setAddonExtensionId(exts[0].id);
      } else if (orderType === "rental" && rentalProductId) {
        const rp = await getRentalProductById(rentalProductId);
        setRentalProduct(rp);
      } else if (orderType === "domain" && extensionId) {
        const e = await getDomainExtensionById(extensionId);
        setExtension(e);
      }
      setLoading(false);
    };
    load();
  }, [user, authLoading, orderType, productId, rentalProductId, extensionId, navigate]);

  const getBasePrice = (): number => {
    if (orderType === "product" && product) return product.price;
    if (orderType === "rental" && rentalProduct) {
      const map: Record<RentalPlan, number> = {
        "1month": rentalProduct.price_1month,
        "3months": rentalProduct.price_3months,
        "1year": rentalProduct.price_1year,
      };
      return map[rentalPlan];
    }
    if (orderType === "domain" && extension) return extension.price;
    return 0;
  };

  const getAddonPrice = (): number => {
    if (!addDomain || !addonExtensionId) return 0;
    return domainExtensions.find((e) => e.id === addonExtensionId)?.price ?? 0;
  };

  const getAddonExt = () => domainExtensions.find((e) => e.id === addonExtensionId);

  const totalPrice = getBasePrice() + getAddonPrice();

  const handlePayment = async () => {
    if (!user) return;
    if (!agreedToTerms) { toast.error("Please agree to the terms before proceeding."); return; }
    if (orderType === "product" && addDomain && !addonDomainName.trim()) {
      toast.error("Please enter a domain name for the add-on.");
      return;
    }

    setPaying(true);

    const payload = {
      order_type: orderType,
      product_id: productId || undefined,
      rental_product_id: rentalProductId || undefined,
      rental_plan: orderType === "rental" ? rentalPlan : undefined,
      domain_name: domainName || undefined,
      domain_extension_id: extensionId || undefined,
      addon_domain_name: (addDomain && addonDomainName) ? addonDomainName : undefined,
      addon_domain_extension_id: (addDomain && addonExtensionId) ? addonExtensionId : undefined,
      customer_name: user.full_name || user.username || user.email,
      customer_email: user.email,
      customer_phone: phone || undefined,
    };

    const result = await initializePayment(payload);

    if (!result.success) {
      toast.error(result.error || "Payment initialization failed.");
      setPaying(false);
      return;
    }

    if (result.payment_link) {
      window.location.href = result.payment_link;
    } else if (result.public_key && result.tx_ref) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => {
        const itemName =
          product?.name || rentalProduct?.name ||
          (domainName && extension ? `${domainName}${extension.extension}` : "Digital Product");
        window.FlutterwaveCheckout({
          public_key: result.public_key,
          tx_ref: result.tx_ref,
          amount: result.amount,          // NGN amount
          currency: "NGN",
          payment_options: "card, banktransfer, ussd",
          customer: {
            email: user.email,
            name: user.full_name || user.username,
            phone_number: phone,
          },
          customizations: {
            title: "Nuvia Marketplace",
            description: itemName,
            logo: "/favicon.svg",
          },
          callback: (data: { status: string; tx_ref: string }) => {
            if (data.status === "successful" || data.status === "completed") {
              navigate(`/payment/callback?status=successful&tx_ref=${result.tx_ref}`);
            } else {
              navigate(`/payment/callback?status=failed&tx_ref=${result.tx_ref}`);
            }
          },
          onclose: () => { setPaying(false); toast.info("Payment was cancelled."); },
        });
      };
      document.body.appendChild(script);
    } else {
      toast.error("Unable to initialize payment. Please contact support.");
      setPaying(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-nuvia-ivory pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nuvia-forest/20 border-t-nuvia-espresso rounded-full animate-spin" />
      </div>
    );
  }

  const itemName = product?.name || rentalProduct?.name ||
    (domainName && extension ? `${domainName}${extension.extension}` : "Item");

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
      <div className="nuvia-container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 glass-chip rounded-full text-[11px] font-bold text-nuvia-forest uppercase tracking-[0.12em] mb-3">
              <Lock className="w-3 h-3" /> Secure Checkout
            </span>
            <h1 className="font-display text-3xl text-nuvia-ink font-bold mb-1">Complete your order</h1>
            <p className="text-nuvia-brown text-sm flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-nuvia-moss" /> Your payment is encrypted and secure
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-3 space-y-4">
              {/* Product info */}
              <div className="card-nuvia rounded-2xl p-6">
                <h2 className="font-semibold text-nuvia-ink mb-4">Order Summary</h2>
                <div className="flex gap-4">
                  {(product?.primary_image_url || rentalProduct?.primary_image_url) && (
                    <img
                      src={product?.primary_image_url || rentalProduct?.primary_image_url}
                      alt={itemName}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-display text-lg text-nuvia-ink">{itemName}</p>
                    <p className="text-sm text-nuvia-brown capitalize">
                      {orderType === "domain"
                        ? "Domain Name"
                        : orderType === "rental"
                        ? `${rentalProduct?.product_type || product?.product_type} Rental — ${PLAN_LABELS[rentalPlan]}`
                        : `Full Ownership ${product?.product_type}`}
                    </p>
                    {orderType === "rental" && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs bg-nuvia-sage/15 text-nuvia-moss border border-nuvia-sage/40 px-2 py-0.5 rounded-full">
                          <RefreshCw className="w-2.5 h-2.5 inline mr-1" />Rental — No source code
                        </span>
                      </div>
                    )}
                    {orderType === "product" && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs badge-nuvia-success px-2 py-0.5">
                          <CheckCircle className="w-2.5 h-2.5 inline mr-1" />Full Ownership
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-nuvia-ink text-lg">{formatPrice(getBasePrice())}</p>
                </div>
              </div>

              {/* Domain add-on (website full ownership only) */}
              {orderType === "product" && product?.product_type === "website" && domainExtensions.length > 0 && (
                <div className="card-nuvia rounded-2xl p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addDomain}
                      onChange={(e) => setAddDomain(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-nuvia-forest"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-nuvia-ink text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Add a Domain Name
                        {getAddonExt() && (
                          <span className="text-xs text-nuvia-brown font-normal">
                            + {formatPrice(getAddonExt()!.price)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-nuvia-brown mt-0.5">
                        Bundle your website with a domain registration
                      </p>
                    </div>
                  </label>
                  {addDomain && (
                    <div className="mt-4 space-y-3 pl-7">
                      <div>
                        <label className="label-nuvia">Domain Name</label>
                        <input
                          type="text"
                          value={addonDomainName}
                          onChange={(e) => setAddonDomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="mywebsite"
                          className="input-nuvia"
                        />
                      </div>
                      <div>
                        <label className="label-nuvia">Extension</label>
                        <select value={addonExtensionId} onChange={(e) => setAddonExtensionId(e.target.value)} className="input-nuvia">
                          {domainExtensions.map((ext) => (
                            <option key={ext.id} value={ext.id}>
                              {ext.extension} — {formatPrice(ext.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {addonDomainName && getAddonExt() && (
                        <p className="text-xs text-nuvia-brown">
                          You're registering: <strong className="text-nuvia-ink">{addonDomainName}{getAddonExt()!.extension}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Info */}
              <div className="card-nuvia rounded-2xl p-6">
                <h2 className="font-semibold text-nuvia-ink mb-4">Your Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="label-nuvia">Full Name</label>
                    <p className="text-sm text-nuvia-ink bg-nuvia-beige-light/80 border border-nuvia-surface-2/40 px-4 py-2.5 rounded-xl">{user?.full_name || user?.username || user?.email}</p>
                  </div>
                  <div>
                    <label className="label-nuvia">Email Address</label>
                    <p className="text-sm text-nuvia-ink bg-nuvia-beige-light/80 border border-nuvia-surface-2/40 px-4 py-2.5 rounded-xl">{user?.email}</p>
                  </div>
                  <div>
                    <label className="label-nuvia">Phone Number (optional)</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className="input-nuvia" />
                  </div>
                </div>
              </div>

              {/* Notices */}
              {orderType === "domain" && (
                <div className="bg-nuvia-champagne/20 border border-nuvia-champagne/50 rounded-2xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#8A6428] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#7A5A2E]">Manual Fulfillment</p>
                    <p className="text-xs text-[#7A5A2E] mt-0.5">Domain orders are fulfilled manually by the Nuvia team.</p>
                  </div>
                </div>
              )}
              {orderType === "rental" && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                  <RefreshCw className="w-5 h-5 text-nuvia-moss flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-nuvia-moss">Rental Order — Manual Activation</p>
                    <p className="text-xs text-nuvia-moss mt-0.5">
                      After payment is confirmed, our team will activate your rental and send you access details.
                      No source code is included in rental plans.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-strong rounded-2xl p-6 sticky top-24 light-streak">
                <h2 className="font-semibold text-nuvia-ink mb-5">Payment Details</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-nuvia-brown">{itemName}</span>
                    <span className="text-nuvia-ink">{formatPrice(getBasePrice())}</span>
                  </div>
                  {addDomain && getAddonExt() && addonDomainName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-nuvia-brown">Domain: {addonDomainName}{getAddonExt()!.extension}</span>
                      <span className="text-nuvia-ink">{formatPrice(getAddonPrice())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-nuvia-brown">Processing fee</span>
                    <span className="text-nuvia-ink">Included</span>
                  </div>
                  <div className="border-t border-nuvia-surface pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-nuvia-ink">Total</span>
                      <span className="font-bold text-2xl text-nuvia-ink">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 mb-5 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-nuvia-surface-2 accent-nuvia-forest" />
                  <span className="text-xs text-nuvia-brown">
                    {orderType === "rental"
                      ? "I understand this is a rental plan — no source code is provided. All payments are non-refundable."
                      : "I agree to purchase this digital product. This is a full ownership purchase. All sales are final."}
                  </span>
                </label>

                <button
                  onClick={handlePayment}
                  disabled={paying || !agreedToTerms}
                  className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {paying
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><Shield className="w-4 h-4" /> Pay {formatPrice(totalPrice)} Securely</>}
                </button>

                <div className="mt-4 pt-4 border-t border-nuvia-surface">
                  <p className="text-xs text-nuvia-brown text-center flex items-center justify-center gap-1 mb-3">
                    <Lock className="w-3 h-3" /> Powered by Flutterwave · 256-bit SSL
                  </p>
                  <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs text-nuvia-brown hover:text-nuvia-ink transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Need help? Chat with us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
