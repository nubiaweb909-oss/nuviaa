import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Globe, Tag,
  Users, Star, Settings, ArrowLeft, ShieldCheck, Menu, X, Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import { RefreshCw } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Buy Products", href: "/admin/products", icon: Package },
  { label: "Rental Products", href: "/admin/rental-products", icon: RefreshCw },
  { label: "Rental Subscriptions", href: "/admin/rental-subscriptions", icon: Calendar },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Domains", href: "/admin/domains", icon: Globe },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function NavItem({ label, href, icon: Icon, active, onClick }: {
  label: string; href: string; icon: typeof LayoutDashboard; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-nuvia-champagne/15 text-nuvia-champagne shadow-nuvia-sm"
          : "text-nuvia-surface-2 hover:text-nuvia-ivory hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", active && "text-nuvia-champagne")} />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-nuvia-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nuvia-forest/20 border-t-nuvia-forest rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;

  const isActive = (href: string) =>
    location.pathname === href || (href !== "/admin" && location.pathname.startsWith(href));

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10 flex-shrink-0">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest border border-nuvia-sage-light/20 flex items-center justify-center">
          <span className="font-display text-nuvia-ivory text-sm font-bold">N</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-nuvia-champagne ring-2 ring-nuvia-ink/60" />
        </div>
        <div>
          <p className="font-display font-bold text-nuvia-ivory text-sm leading-none">Nuvia</p>
          <p className="text-[10px] text-nuvia-champagne/80 mt-0.5 flex items-center gap-1 uppercase tracking-[0.12em]">
            <ShieldCheck className="w-2.5 h-2.5" /> Admin
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon }) => (
          <NavItem
            key={href}
            label={label}
            href={href}
            icon={icon}
            active={isActive(href)}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-nuvia-surface-2 hover:text-nuvia-ivory hover:bg-white/5 transition-all"
          onClick={onNavClick}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-nuvia-ivory">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-nuvia-dark border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center">
            <span className="font-display text-nuvia-ivory text-xs font-bold">N</span>
          </div>
          <span className="font-display font-bold text-nuvia-ivory text-sm">Admin Panel</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-nuvia-surface-2 hover:text-nuvia-ivory hover:bg-white/5 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-nuvia-dark border-r border-white/10 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-nuvia-ink/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-nuvia-dark shadow-nuvia-xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center">
                    <span className="font-display text-nuvia-ivory text-xs font-bold">N</span>
                  </div>
                  <span className="font-display font-bold text-nuvia-ivory text-sm">Admin</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-nuvia-surface-2 hover:text-nuvia-ivory hover:bg-white/5 transition-all"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent onNavClick={() => setSidebarOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0 relative">
        <div aria-hidden className="absolute top-0 inset-x-0 h-56 bg-nuvia-hero pointer-events-none" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] relative">
          {children}
        </div>
      </main>
    </div>
  );
}
