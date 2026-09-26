import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Globe, Clock, ChevronRight, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUserLibrary, getUserOrders } from "@/services/orderService";
import { getUserSubscriptions } from "@/services/rentalService";
import { useAuth } from "@/hooks/useAuth";
import type { UserLibraryItem, Order, RentalSubscription } from "@/types";
import { formatPrice, formatRelativeDate, getStatusColor } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserLibraryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subs, setSubs] = useState<RentalSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserLibrary(user.id),
      getUserOrders(user.id),
      getUserSubscriptions(user.id),
    ]).then(([lib, ords, subscriptions]) => {
      setLibrary(lib);
      setOrders(ords);
      setSubs(subscriptions);
      setLoading(false);
    });
  }, [user]);

  const products = library.filter((l) => l.purchase_type === "product");
  const domains = library.filter((l) => l.purchase_type === "domain");
  const activeSubs = subs.filter((s) => s.status === "active");

  const stats = [
    { label: "Owned Products", value: products.length, icon: Package, href: "/dashboard/purchases" },
    { label: "Domains Registered", value: domains.length, icon: Globe, href: "/dashboard/purchases" },
    { label: "Active Rentals", value: activeSubs.length, icon: RefreshCw, href: "/dashboard/subscriptions" },
    { label: "Total Orders", value: orders.length, icon: Clock, href: "/dashboard/purchases" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-espresso">
            Welcome back, {user?.full_name || user?.username} 👋
          </h1>
          <p className="text-sm text-nuvia-brown mt-1">Here's an overview of your Nuvia account</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="card-nuvia rounded-2xl p-5 hover:border-nuvia-brown hover:shadow-nuvia-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-nuvia-forest/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-nuvia-espresso" />
                </div>
                <ChevronRight className="w-4 h-4 text-nuvia-brown group-hover:text-nuvia-espresso transition-colors" />
              </div>
              <p className="font-display text-2xl text-nuvia-espresso">{stat.value}</p>
              <p className="text-xs text-nuvia-brown mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card-nuvia rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-nuvia-espresso">Recent Orders</h2>
            <Link to="/dashboard/purchases" className="text-xs text-nuvia-brown hover:text-nuvia-espresso">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-nuvia-surface rounded-xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-nuvia-brown mb-3">No orders yet</p>
              <Link to="/marketplace" className="btn-primary text-sm">Browse Marketplace</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-nuvia-surface last:border-0">
                  <div>
                    <p className="text-sm font-medium text-nuvia-espresso font-mono">{order.order_reference}</p>
                    <p className="text-xs text-nuvia-brown">{formatRelativeDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge-nuvia border text-xs ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                    <span className="font-medium text-nuvia-espresso text-sm">{formatPrice(order.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/marketplace" className="bg-nuvia-forest rounded-2xl p-5 group hover:bg-nuvia-forest-dark transition-colors">
            <Package className="w-6 h-6 text-nuvia-surface mb-3" />
            <p className="font-display text-nuvia-ivory text-sm">Buy Products</p>
            <p className="text-xs text-nuvia-surface-2 mt-0.5">Full ownership purchases</p>
          </Link>
          <Link to="/rent" className="bg-nuvia-beige-light border border-nuvia-surface rounded-2xl p-5 group hover:border-nuvia-brown transition-colors">
            <RefreshCw className="w-6 h-6 text-nuvia-espresso mb-3" />
            <p className="font-display text-nuvia-espresso text-sm">Rent a Product</p>
            <p className="text-xs text-nuvia-brown mt-0.5">Monthly & yearly rental plans</p>
          </Link>
          <Link to="/domains" className="bg-nuvia-beige-light border border-nuvia-surface rounded-2xl p-5 group hover:border-nuvia-brown transition-colors">
            <Globe className="w-6 h-6 text-nuvia-espresso mb-3" />
            <p className="font-display text-nuvia-espresso text-sm">Find a Domain</p>
            <p className="text-xs text-nuvia-brown mt-0.5">Register your domain name</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
