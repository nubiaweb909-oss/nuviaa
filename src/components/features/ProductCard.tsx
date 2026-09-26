import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowUpRight, Sparkles } from "lucide-react";
import type { Product, SeedProduct } from "@/types";
import { formatPrice } from "@/lib/utils";
import BrowserMockup from "./BrowserMockup";
import TiltCard from "./TiltCard";

type CardProduct = Product | (SeedProduct & { id: string });

interface ProductCardProps {
  product: CardProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const slug = product.slug;
  const imageUrl = product.primary_image_url;
  const rawCategory = "category" in product ? product.category : "";
  const category = typeof rawCategory === "string" ? rawCategory : rawCategory?.name ?? "";
  const isFeatured = product.is_featured;
  const rating = product.average_rating;
  const reviewCount = product.review_count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <TiltCard maxTilt={5} scale={1.015}>
        <Link
          to={`/products/${slug}`}
          className="group block card-nuvia overflow-hidden rounded-2xl h-full"
        >
          {/* Showcase preview */}
          <div className="relative p-3 pb-0 bg-gradient-to-b from-nuvia-beige-light/80 to-nuvia-beige/40 overflow-hidden">
            {isFeatured && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1 px-2.5 py-1 glass-chip rounded-full text-[11px] font-semibold text-nuvia-forest">
                <Sparkles className="w-3 h-3" /> Featured
              </div>
            )}
            <div className="transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:-translate-y-0.5">
              <BrowserMockup
                imageUrl={imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=70"}
                alt={product.name}
                aspectRatio="3/2"
                className="rounded-t-lg rounded-b-none shadow-nuvia-md"
                lazy
              />
            </div>
          </div>

          {/* Info */}
          <div className="p-5 relative">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-nuvia-brown uppercase tracking-[0.12em]">{category}</span>
                <h3 className="font-display text-lg text-nuvia-ink mt-0.5 leading-snug">
                  {product.name}
                </h3>
              </div>
              <span
                className={`badge-nuvia text-[10px] flex-shrink-0 border ${
                  product.product_type === "app"
                    ? "bg-nuvia-sage/15 text-nuvia-moss border-nuvia-sage/40"
                    : "bg-nuvia-beige-light text-nuvia-brown border-nuvia-surface-2/60"
                }`}
              >
                {product.product_type === "app" ? "App" : "Website"}
              </span>
            </div>

            <p className="text-sm text-nuvia-brown leading-relaxed mb-4 line-clamp-2">
              {"overview" in product ? product.overview : ""}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans font-bold text-lg text-nuvia-ink">{formatPrice(product.price, product.currency)}</p>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-nuvia-champagne text-nuvia-champagne" />
                    <span className="text-xs text-nuvia-brown">{rating.toFixed(1)} ({reviewCount})</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-xs font-semibold text-nuvia-forest">View Details</span>
                <span className="w-6 h-6 rounded-full bg-nuvia-forest flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-nuvia-ivory" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
