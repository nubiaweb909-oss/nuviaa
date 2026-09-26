import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, MessageCircle } from "lucide-react";
import ProductCard from "@/components/features/ProductCard";
import RevealAnimation from "@/components/features/RevealAnimation";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import type { Product, Category } from "@/types";
import { SORT_OPTIONS, WHATSAPP_URL } from "@/constants";

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const featured = searchParams.get("featured") === "true";

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({
      search: search || undefined,
      product_type: type || undefined,
      category_slug: category || undefined,
      is_featured: featured || undefined,
      sort,
    }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search, type, category, sort, featured]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    // Close filters on mobile after selection
    if (window.innerWidth < 1024) setFiltersOpen(false);
  };

  const clearAll = () => {
    setSearchParams({});
    setFiltersOpen(false);
  };

  const hasFilters = !!(search || type || category || featured);

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
      {/* Header */}
      <div className="bg-nuvia-hero border-b border-nuvia-surface/60 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
        <div className="nuvia-container py-8 sm:py-10 relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 glass-chip rounded-full text-[11px] font-semibold text-nuvia-brown mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-nuvia-champagne" />
            The Collection
          </span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-nuvia-ink font-bold mb-1.5">
            {type === "website"
              ? "Own a Website"
              : type === "app"
              ? "Own an Application"
              : featured
              ? "Featured Products"
              : "Buy — Full Ownership"}
          </h1>
          <p className="text-nuvia-brown text-sm sm:text-base">
            {type === "website"
              ? "Professionally designed websites — full ownership, yours forever"
              : type === "app"
              ? "Full-stack applications — full source code, full ownership"
              : "Browse our curated collection. Every purchase is full ownership — no subscriptions."}
          </p>
        </div>
      </div>

      {/* DM nudge */}
      <div className="bg-nuvia-beige-light/70 border-b border-nuvia-surface/60">
        <div className="nuvia-container py-2.5 flex items-center justify-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-nuvia-moss flex-shrink-0" />
          <p className="text-xs sm:text-sm text-nuvia-brown text-center">
            Can't find what you seek?{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-nuvia-forest underline underline-offset-2 hover:text-nuvia-moss transition-colors"
            >
              Send us a DM 😉
            </a>
          </p>
        </div>
      </div>

      <div className="nuvia-container py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <>
            {/* Mobile filter backdrop */}
            {filtersOpen && (
              <div
                className="fixed inset-0 z-30 bg-nuvia-ink/30 backdrop-blur-sm lg:hidden"
                onClick={() => setFiltersOpen(false)}
              />
            )}

            <aside
              className={`
                fixed top-0 left-0 bottom-0 z-40 w-72 bg-nuvia-ivory shadow-nuvia-xl overflow-y-auto
                lg:static lg:w-56 lg:flex-shrink-0 lg:shadow-none lg:z-auto lg:translate-x-0 lg:block
                ${filtersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                transition-transform duration-300 lg:transition-none
              `}
              style={{ paddingTop: filtersOpen ? "0" : undefined }}
            >
              <div className="lg:sticky lg:top-24 card-nuvia rounded-2xl overflow-hidden">
                {/* Mobile header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-nuvia-surface lg:hidden">
                  <h3 className="font-medium text-nuvia-espresso text-sm">Filters</h3>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="p-1.5 rounded-lg text-nuvia-brown hover:bg-nuvia-surface/60 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="hidden lg:flex items-center justify-between mb-5">
                    <h3 className="font-medium text-nuvia-espresso text-sm">Filters</h3>
                    {hasFilters && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-nuvia-brown hover:text-nuvia-espresso flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Clear all
                      </button>
                    )}
                  </div>

                  {/* Product Type */}
                  <div className="mb-5">
                    <label className="label-nuvia">Product Type</label>
                    <div className="space-y-1.5">
                      {(["", "website", "app"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setParam("type", t)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all min-h-[44px] ${
                            type === t
                              ? "bg-nuvia-forest text-nuvia-ivory"
                              : "text-nuvia-brown hover:bg-nuvia-surface/60 hover:text-nuvia-espresso"
                          }`}
                        >
                          {t === "" ? "All Products" : t === "website" ? "Websites" : "Applications"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-5">
                    <label className="label-nuvia">Category</label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setParam("category", "")}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all min-h-[44px] ${
                          !category
                            ? "bg-nuvia-forest text-nuvia-ivory"
                            : "text-nuvia-brown hover:bg-nuvia-surface/60 hover:text-nuvia-espresso"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setParam("category", cat.slug)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all min-h-[44px] ${
                            category === cat.slug
                              ? "bg-nuvia-forest text-nuvia-ivory"
                              : "text-nuvia-brown hover:bg-nuvia-surface/60 hover:text-nuvia-espresso"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured */}
                  <div>
                    <label className="label-nuvia">Curation</label>
                    <button
                      onClick={() => setParam("featured", featured ? "" : "true")}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all min-h-[44px] ${
                        featured
                          ? "bg-nuvia-forest text-nuvia-ivory"
                          : "text-nuvia-brown hover:bg-nuvia-surface/60 hover:text-nuvia-espresso"
                      }`}
                    >
                      Featured Only
                    </button>
                  </div>

                  {/* Mobile clear */}
                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      className="lg:hidden mt-4 w-full flex items-center justify-center gap-1 text-xs text-nuvia-brown hover:text-nuvia-espresso border border-nuvia-surface-2 rounded-xl py-2.5 transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nuvia-brown pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setParam("search", e.target.value)}
                  placeholder="Search products…"
                  className="input-nuvia pl-9"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="input-nuvia flex-1 sm:w-44 sm:flex-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  className="lg:hidden btn-secondary px-3 min-w-[44px] min-h-[44px] flex items-center justify-center relative"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {hasFilters && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-nuvia-forest text-nuvia-ivory text-[9px] rounded-full flex items-center justify-center">
                      {[search, type, category, featured ? "f" : ""].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-nuvia-forest text-nuvia-ivory text-xs rounded-full">
                    "{search}"
                    <button onClick={() => setParam("search", "")} aria-label="Remove search filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {type && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-nuvia-forest text-nuvia-ivory text-xs rounded-full capitalize">
                    {type}
                    <button onClick={() => setParam("type", "")} aria-label="Remove type filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-nuvia-forest text-nuvia-ivory text-xs rounded-full">
                    {categories.find((c) => c.slug === category)?.name || category}
                    <button onClick={() => setParam("category", "")} aria-label="Remove category filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {featured && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-nuvia-forest text-nuvia-ivory text-xs rounded-full">
                    Featured
                    <button onClick={() => setParam("featured", "")} aria-label="Remove featured filter">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="card-nuvia rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-nuvia-surface" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-nuvia-surface rounded w-3/4" />
                      <div className="h-3 bg-nuvia-surface rounded w-full" />
                      <div className="h-3 bg-nuvia-surface rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 sm:py-24">
                <p className="font-display text-2xl text-nuvia-espresso mb-2">No products found</p>
                <p className="text-nuvia-brown text-sm mb-6">Try adjusting your search or filters</p>
                <button onClick={clearAll} className="btn-secondary">Clear all filters</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-nuvia-brown mb-4">
                  {products.length === 1 ? "1 product" : `${products.length} products`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
