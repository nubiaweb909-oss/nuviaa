import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, ShoppingCart, Globe, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAdminStats } from "@/services/adminService";
import type { AdminStats } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((s) => { setStats(s); setLoading(false); });
  }, []);

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.total_users, icon: Users, color: "bg-nuvia-sage/15 text-nuvia-moss" },
        { label: "Total Products", value: stats.total_products, icon: Package, color: "bg-nuvia-surface text-nuvia-espresso" },
        { label: "Websites", value: stats.total_websites, icon: Globe, color: "bg-nuvia-surface text-nuvia-espresso" },
        { label: "Applications", value: stats.total_apps, icon: TrendingUp, color: "bg-purple-50 text-purple-700" },
        { label: "Domains Sold", value: stats.total_domains_sold, icon: Globe, color: "bg-emerald-50 text-nuvia-forest" },
        { label: "Total Orders", value: stats.total_orders, icon: ShoppingCart, color: "bg-nuvia-surface text-nuvia-espresso" },
        { label: "Pending Fulfillment", value: stats.pending_fulfillment, icon: Clock, color: "bg-amber-50 text-[#7A5A2E]" },
        { label: "Successful Payments", value: stats.successful_payments, icon: CheckCircle, color: "bg-emerald-50 text-nuvia-forest" },
        { label: "Failed Payments", value: stats.failed_payments, icon: XCircle, color: "bg-red-50 text-red-700" },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Admin Dashboard</h1>
          <p className="text-sm text-nuvia-brown mt-1">Overview of your marketplace</p>
        </div>

        {/* Revenue card */}
        {stats && (
          <div className="glass-dark rounded-2xl p-6 text-nuvia-ivory light-streak relative overflow-hidden">
            <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-nuvia-champagne/15 blur-[70px] pointer-events-none" />
            <p className="text-[11px] text-nuvia-champagne/90 uppercase tracking-[0.14em] mb-1 font-bold">Verified Revenue</p>
            <p className="font-display text-4xl font-bold">{formatPrice(stats.verified_revenue)}</p>
            <p className="text-xs text-nuvia-surface-2 mt-2">From {stats.successful_payments} verified successful payments</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-24 card-nuvia rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="card-nuvia rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(" ").slice(0,1).join(" ")}`}>
                  <s.icon className={`w-4 h-4 ${s.color.split(" ").slice(1).join(" ")}`} />
                </div>
                <p className="font-display text-2xl text-nuvia-ink font-bold">{s.value}</p>
                <p className="text-xs text-nuvia-brown mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Product", href: "/admin/products/new", icon: Package },
            { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
            { label: "Manage Domains", href: "/admin/domains", icon: Globe },
            { label: "Site Settings", href: "/admin/settings", icon: TrendingUp },
          ].map((link) => (
            <Link key={link.href} to={link.href} className="card-nuvia rounded-2xl p-4 hover:shadow-nuvia-md hover:-translate-y-0.5 transition-all text-center">
              <link.icon className="w-5 h-5 text-nuvia-forest mx-auto mb-2" />
              <p className="text-xs font-semibold text-nuvia-ink">{link.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
