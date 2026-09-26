import { useEffect, useState } from "react";
import { RefreshCw, Calendar, Globe, Clock, ExternalLink, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUserSubscriptions } from "@/services/rentalService";
import { useAuth } from "@/hooks/useAuth";
import type { RentalSubscription } from "@/types";
import { formatDate, formatPrice, timeRemaining, getStatusColor } from "@/lib/utils";
import { PLAN_LABELS } from "@/services/rentalService";
import { WHATSAPP_URL } from "@/constants";

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, string> = {
    active: "bg-[#AFC79B]/20 text-nuvia-forest border-[#AFC79B]/50",
    pending: "bg-nuvia-champagne/20 text-[#7A5A2E] border-nuvia-champagne/50",
    expired: "bg-gray-50 text-gray-600 border-gray-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    suspended: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`badge-nuvia border text-xs capitalize ${statusMap[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

function CountdownBadge({ endDate, status }: { endDate: string; status: string }) {
  if (status === "expired" || status === "cancelled") return null;
  if (!endDate) return null;
  const { label, urgent } = timeRemaining(endDate);
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
      urgent ? "bg-red-50 text-red-700 border-red-200" : "bg-nuvia-sage/15 text-nuvia-moss border-nuvia-sage/40"
    }`}>
      <Clock className="w-3 h-3" />
      {label} remaining
    </span>
  );
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<RentalSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserSubscriptions(user.id).then((s) => { setSubs(s); setLoading(false); });
  }, [user]);

  const active = subs.filter((s) => s.status === "active");
  const other = subs.filter((s) => s.status !== "active");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-espresso">My Rentals</h1>
          <p className="text-sm text-nuvia-brown mt-1">Active and past rental subscriptions</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 card-nuvia rounded-2xl animate-pulse" />)}
          </div>
        ) : subs.length === 0 ? (
          <div className="card-nuvia rounded-2xl p-12 text-center">
            <RefreshCw className="w-10 h-10 text-nuvia-surface-2 mx-auto mb-3" />
            <p className="font-display text-xl text-nuvia-espresso mb-2">No active rentals</p>
            <p className="text-sm text-nuvia-brown mb-5">Browse our rental catalogue to get started</p>
            <Link to="/rent" className="btn-primary">Explore Rentals</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active subscriptions */}
            {active.length > 0 && (
              <div>
                <h2 className="font-semibold text-nuvia-espresso text-sm mb-3">Active Rentals</h2>
                <div className="space-y-4">
                  {active.map((sub) => <SubscriptionCard key={sub.id} sub={sub} />)}
                </div>
              </div>
            )}

            {/* Past/pending */}
            {other.length > 0 && (
              <div>
                <h2 className="font-semibold text-nuvia-espresso text-sm mb-3">Other Subscriptions</h2>
                <div className="space-y-4">
                  {other.map((sub) => <SubscriptionCard key={sub.id} sub={sub} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SubscriptionCard({ sub }: { sub: RentalSubscription }) {
  const product = sub.rental_product;
  const isActive = sub.status === "active";
  const isExpired = sub.status === "expired";

  return (
    <div className={`bg-nuvia-ivory border rounded-2xl p-5 ${isActive ? "border-[#AFC79B]/50" : "border-nuvia-surface"}`}>
      <div className="flex items-start gap-4">
        {product?.primary_image_url && (
          <img src={product.primary_image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        )}
        {!product?.primary_image_url && (
          <div className="w-16 h-16 rounded-xl bg-nuvia-beige-light flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-7 h-7 text-nuvia-espresso" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-display text-lg text-nuvia-espresso">{product?.name || "Rental Product"}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={sub.status} />
                <span className="badge-nuvia bg-nuvia-surface text-nuvia-brown text-xs border border-nuvia-surface-2">
                  {PLAN_LABELS[sub.plan]}
                </span>
                {sub.end_date && <CountdownBadge endDate={sub.end_date} status={sub.status} />}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-nuvia-espresso">{formatPrice(sub.usd_price)}</p>
              <p className="text-xs text-nuvia-brown mt-0.5">paid via Flutterwave</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-nuvia-brown">
            {sub.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Started {formatDate(sub.start_date)}
              </span>
            )}
            {sub.end_date && (
              <span className={`flex items-center gap-1 ${isExpired ? "text-red-600" : ""}`}>
                <Clock className="w-3 h-3" />
                Expires {formatDate(sub.end_date)}
              </span>
            )}
          </div>

          {/* Access URL */}
          {isActive && sub.access_url && (
            <div className="mt-3 pt-3 border-t border-nuvia-surface">
              <a
                href={sub.access_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-primary text-sm py-2 px-4"
              >
                <Globe className="w-3.5 h-3.5" /> Open Your Rental
              </a>
            </div>
          )}

          {/* Access notes */}
          {isActive && sub.access_notes && (
            <div className="mt-2 text-xs text-nuvia-brown bg-nuvia-beige-light rounded-lg px-3 py-2">
              {sub.access_notes}
            </div>
          )}

          {/* Pending */}
          {sub.status === "pending" && sub.payment_status === "successful" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#7A5A2E] bg-nuvia-champagne/20 border border-nuvia-champagne/50 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              Your rental is pending activation. Our team will contact you soon.
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="ml-auto underline">
                Contact us
              </a>
            </div>
          )}

          {/* Demo link */}
          {product?.demo_url && (
            <a href={product.demo_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-nuvia-brown hover:text-nuvia-espresso mt-2 transition-colors">
              <ExternalLink className="w-3 h-3" /> View Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
