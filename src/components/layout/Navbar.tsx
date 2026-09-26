import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, User, LogOut, LayoutDashboard, ShieldCheck, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/constants";
import { toast } from "sonner";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const initials = user
    ? (user.full_name || user.username || user.email).charAt(0).toUpperCase()
    : "";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-x-0",
          scrolled ? "glass-strong shadow-nuvia-md" : "glass-clear"
        )}
      >
        <div className="nuvia-container">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
              aria-label="Nuvia Home"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center flex-shrink-0 shadow-nuvia-sm group-hover:shadow-glow-champagne transition-shadow duration-300">
                <span className="font-display text-nuvia-ivory text-sm font-bold">N</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-nuvia-champagne ring-2 ring-nuvia-ivory/80" />
              </div>
              <span className="font-display text-xl font-bold text-nuvia-ink tracking-tight">
                Nuvia
              </span>
            </Link>

            {/* Desktop Nav — center */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map((link) => {
                const active =
                  location.pathname === link.href ||
                  (link.href !== "/" &&
                    location.pathname.startsWith(link.href.split("?")[0]));
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "px-3.5 py-2 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap",
                      active
                        ? "text-nuvia-ivory bg-nuvia-forest shadow-nuvia-sm"
                        : "text-nuvia-brown hover:text-nuvia-ink hover:bg-nuvia-beige-light/80"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full glass-chip text-nuvia-brown hover:text-nuvia-forest transition-all flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full glass-chip transition-all min-h-[44px]"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center flex-shrink-0">
                      <span className="text-nuvia-ivory text-xs font-semibold">{initials}</span>
                    </div>
                    <span className="text-sm text-nuvia-ink font-semibold hidden sm:block max-w-[90px] truncate">
                      {user.full_name || user.username}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-nuvia-brown transition-transform hidden sm:block",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-nuvia-surface/50">
                          <p className="text-xs text-nuvia-brown">Signed in as</p>
                          <p className="text-sm font-semibold text-nuvia-ink truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1.5 px-1.5">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-nuvia-brown hover:bg-nuvia-beige-light/80 hover:text-nuvia-ink rounded-xl transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" /> Dashboard
                          </Link>
                          <Link
                            to="/dashboard/profile"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-nuvia-brown hover:bg-nuvia-beige-light/80 hover:text-nuvia-ink rounded-xl transition-all"
                          >
                            <User className="w-4 h-4 flex-shrink-0" /> Profile
                          </Link>
                          {user.is_admin && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-nuvia-moss hover:bg-nuvia-beige-light/80 hover:text-nuvia-forest rounded-xl transition-all"
                            >
                              <ShieldCheck className="w-4 h-4 flex-shrink-0" /> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="py-1.5 px-1.5 border-t border-nuvia-surface/50">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-nuvia-terra hover:bg-nuvia-terra/10 rounded-xl transition-all"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/auth/sign-in" className="text-sm font-semibold px-4 py-2.5 min-h-[44px] flex items-center text-nuvia-brown hover:text-nuvia-ink transition-colors rounded-full">
                    Sign In
                  </Link>
                  <Link to="/auth/sign-up" className="btn-primary text-sm px-5 py-2.5 min-h-[44px]">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden w-10 h-10 rounded-full glass-chip text-nuvia-brown hover:text-nuvia-ink transition-all flex items-center justify-center"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-nuvia-ink/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] glass-strong md:hidden flex flex-col !rounded-none !border-y-0"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-nuvia-surface/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center">
                    <span className="font-display text-nuvia-ivory text-xs font-bold">N</span>
                  </div>
                  <span className="font-display font-bold text-nuvia-ink">Nuvia</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full text-nuvia-brown hover:bg-nuvia-beige-light/80 transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => {
                  const active =
                    location.pathname === link.href ||
                    (link.href !== "/" &&
                      location.pathname.startsWith(link.href.split("?")[0]));
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "flex items-center px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all",
                        active
                          ? "bg-nuvia-forest text-nuvia-ivory shadow-nuvia-sm"
                          : "text-nuvia-brown hover:text-nuvia-ink hover:bg-nuvia-beige-light/80"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Search in mobile */}
                <button
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-nuvia-brown hover:text-nuvia-ink hover:bg-nuvia-beige-light/80 transition-all"
                >
                  <Search className="w-4 h-4" /> Search Products
                </button>
              </nav>

              {/* Auth or user section */}
              <div className="px-4 py-4 border-t border-nuvia-surface/50 flex-shrink-0">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 glass rounded-2xl mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center flex-shrink-0">
                        <span className="text-nuvia-ivory text-sm font-semibold">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-nuvia-ink truncate">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xs text-nuvia-brown truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm text-nuvia-brown hover:bg-nuvia-beige-light/80 hover:text-nuvia-ink transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {user.is_admin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm text-nuvia-brown hover:bg-nuvia-beige-light/80 hover:text-nuvia-ink transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm text-nuvia-terra hover:bg-nuvia-terra/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/auth/sign-in"
                      className="btn-secondary w-full justify-center py-3"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/sign-up"
                      className="btn-primary w-full justify-center py-3"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-nuvia-ink/50 backdrop-blur-md flex items-start justify-center pt-20 sm:pt-28 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl glass-strong rounded-3xl overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 sm:px-5 py-4">
                <Search className="w-5 h-5 text-nuvia-moss flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search websites, apps, categories…"
                  className="flex-1 bg-transparent text-nuvia-ink placeholder-nuvia-brown/50 text-base sm:text-lg outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-nuvia-brown hover:text-nuvia-ink rounded-full hover:bg-nuvia-beige-light/80 transition-all flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
              <div className="px-5 py-3 border-t border-nuvia-surface/50">
                <p className="text-xs text-nuvia-brown/70">
                  Press <kbd className="bg-nuvia-beige-light border border-nuvia-surface-2/60 px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd> to search
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for user menu (desktop) */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
