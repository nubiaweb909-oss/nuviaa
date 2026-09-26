import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import RevealAnimation from "@/components/features/RevealAnimation";
import ImageGallery from "@/components/features/ImageGallery";
import StarRating from "@/components/features/StarRating";
import { getRentalProducts } from "@/services/rentalService";
import type { RentalProduct } from "@/types";
import { formatPrice } from "@/lib/utils";
import { WHATSAPP_URL } from "@/constants";

function RentalProductCard({ product, index }: { product: RentalProduct; index: number }) {
  const images = product.images?.map((i) => i.url) ?? (product.primary_image_url ? [product.primary_image_url] : []);

  return (
    <RevealAnimation delay={index * 0.05}>
      <Link
        to={`/rent/${product.slug}`}
        className="group block card-nuvia rounded-2xl overflow-hidden h-full"
      >
        {/* 1:1 image */}
        <div className="aspect-square bg-nuvia-beige-light overflow-hidden relative">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-nuvia-surface-2" />
            </div>
          )}
          {/* Rental badge */}
          <div className="absolute top-3 left-3 glass-chip text-nuvia-ink text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            RENTAL
          </div>
          {product.is_featured && (
            <div className="absolute top-3 right-3 glass-chip text-nuvia-ink text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-nuvia-terra" /> Featured
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-nuvia-ink font-semibold leading-snug line-clamp-2">
              {product.name}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-nuvia-sage/15 text-nuvia-moss border border-nuvia-sage/40 capitalize flex-shrink-0">
              {product.product_type}
            </span>
          </div>
          {product.overview && (
            <p className="text-xs text-nuvia-brown leading-relaxed line-clamp-2 mb-3">{product.overview}</p>
          )}
          {product.review_count > 0 && (
            <StarRating rating={product.average_rating} size="sm" className="mb-3" />
          )}
          {/* Pricing */}
          <div className="border-t border-nuvia-surface/60 pt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-nuvia-brown">1 Month</span>
              <span className="font-semibold text-nuvia-ink">{formatPrice(product.price_1month)}/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-nuvia-brown">3 Months</span>
              <span className="font-medium text-nuvia-ink">{formatPrice(product.price_3months)}/3mo</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-nuvia-brown">1 Year</span>
              <span className="font-medium text-nuvia-ink">{formatPrice(product.price_1year)}/yr</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="block w-full text-center text-xs font-semibold py-2.5 rounded-full bg-nuvia-forest/10 text-nuvia-forest border border-nuvia-forest/25 group-hover:bg-nuvia-forest group-hover:text-nuvia-ivory group-hover:shadow-nuvia-md transition-all duration-300">
              View Plans &amp; Rent
            </span>
          </div>
        </div>
      </Link>
    </RevealAnimation>
  );
}

export default function RentalMarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    setLoading(true);
    getRentalProducts({ search: search || undefined, product_type: type || undefined, sort }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search, type, sort]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearAll = () => setSearchParams({});
  const hasFilters = !!(search || type);

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
      {/* Header */}
      <div className="bg-nuvia-hero border-b border-nuvia-surface/60 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
        <div className="nuvia-container py-8 sm:py-10 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 glass-chip text-nuvia-forest text-[11px] font-bold rounded-full mb-3">
                <RefreshCw className="w-3 h-3" /> RENTAL PLANS
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-nuvia-ink font-bold mb-1.5">
                Rent a Website or App
              </h1>
              <p className="text-nuvia-brown text-sm sm:text-base max-w-xl">
                Flexible monthly and yearly rental plans. Get a professional web presence without a full purchase commitment.
              </p>
            </div>
            <Link to="/marketplace" className="hidden sm:flex items-center gap-2 text-xs font-semibold text-nuvia-forest hover:text-nuvia-moss glass-chip rounded-full px-4 py-2 transition-all flex-shrink-0">
              Full Ownership →
            </Link>
          </div>
        </div>
      </div>

      {/* DM nudge */}
      <div className="bg-nuvia-beige-light/70 border-b border-nuvia-surface/60">
        <div className="nuvia-container py-2.5 flex items-center justify-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-nuvia-moss flex-shrink-0" />
          <p className="text-xs sm:text-sm text-nuvia-brown text-center">
            Can't find what you seek?{" "}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-nuvia-forest underline underline-offset-2 hover:text-nuvia-moss transition-colors">
              Send us a DM 😉
            </a>
          </p>
        </div>
      </div>

      <div className="nuvia-container py-6 sm:py-8">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nuvia-brown pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setParam("search", e.target.value)}
              placeholder="Search rental products…"
              className="input-nuvia pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["", "website", "app"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setParam("type", t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  type === t
                    ? "bg-nuvia-forest text-nuvia-ivory"
                    : "bg-nuvia-ivory border border-nuvia-surface text-nuvia-brown hover:border-nuvia-brown"
                }`}
              >
                {t === "" ? "All" : t === "website" ? "Websites" : "Apps"}
              </button>
            ))}
            {hasFilters && (
              <button onClick={clearAll} className="px-3 py-2.5 rounded-xl text-sm text-nuvia-brown border border-nuvia-surface bg-nuvia-ivory hover:border-nuvia-brown transition-all min-h-[44px] flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* How rental works info strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { step: "1", title: "Choose a plan", desc: "Select 1 month, 3 months, or 1 year rental" },
            { step: "2", title: "Pay securely", desc: "Checkout via Flutterwave — NGN equivalent charged" },
            { step: "3", title: "Get access", desc: "Our team activates your rental and shares the URL" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 glass rounded-2xl p-4">
              <div className="w-7 h-7 rounded-full bg-nuvia-forest flex items-center justify-center flex-shrink-0">
                <span className="text-nuvia-champagne text-xs font-bold">{s.step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-nuvia-ink">{s.title}</p>
                <p className="text-xs text-nuvia-brown mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-nuvia rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-nuvia-surface" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-nuvia-surface rounded w-3/4" />
                  <div className="h-3 bg-nuvia-surface rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-nuvia-beige-light flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="w-7 h-7 text-nuvia-brown" />
            </div>
            <p className="font-display text-2xl text-nuvia-espresso mb-2">No rental products yet</p>
            <p className="text-nuvia-brown text-sm mb-6">
              Our rental catalogue is being curated. Check back soon or{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-nuvia-espresso underline">
                contact us
              </a>{" "}
              to enquire.
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="btn-secondary">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-nuvia-brown mb-5">
              {products.length === 1 ? "1 rental product" : `${products.length} rental products`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p, i) => <RentalProductCard key={p.id} product={p} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
