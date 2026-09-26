import { Link, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Package, User, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Purchases", href: "/dashboard/purchases", icon: Package },
  { label: "My Rentals", href: "/dashboard/subscriptions", icon: RefreshCw },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-nuvia-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nuvia-forest/20 border-t-nuvia-forest rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16 relative">
      <div aria-hidden className="absolute top-0 inset-x-0 h-64 bg-nuvia-hero pointer-events-none" />
      <div className="nuvia-container py-8 relative">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="glass-strong rounded-2xl p-4 sticky top-24">
              <div className="mb-4 pb-4 border-b border-nuvia-surface/50">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center mb-3 shadow-nuvia-sm">
                  <span className="text-nuvia-ivory font-display text-lg font-bold">
                    {(user.full_name || user.username || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-nuvia-ink text-sm">{user.full_name || user.username}</p>
                <p className="text-xs text-nuvia-brown truncate">{user.email}</p>
              </div>

              <nav className="space-y-1">
                {NAV.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      location.pathname === href
                        ? "bg-nuvia-forest text-nuvia-ivory shadow-nuvia-sm"
                        : "text-nuvia-brown hover:text-nuvia-ink hover:bg-nuvia-beige-light/80"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-nuvia-surface/50">
                <Link to="/" className="flex items-center gap-2 text-xs font-medium text-nuvia-brown hover:text-nuvia-forest transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
