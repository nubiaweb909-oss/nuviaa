import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart, ExternalLink, Play, CheckCircle,
  ArrowLeft, MessageCircle, MonitorPlay,
} from "lucide-react";
import BrowserMockup from "@/components/features/BrowserMockup";
import ImageGallery from "@/components/features/ImageGallery";
import StarRating from "@/components/features/StarRating";
import RevealAnimation from "@/components/features/RevealAnimation";
import VideoModal from "@/components/features/VideoModal";
import ProductCard from "@/components/features/ProductCard";
import { getProductBySlug, getProducts } from "@/services/productService";
import { getProductReviews } from "@/services/reviewService";
import type { Product, ProductReview } from "@/types";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { WHATSAPP_URL } from "@/constants";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      getProductBySlug(slug),
      getProductReviews(slug),
    ]).then(([prod, revs]) => {
      setProduct(prod);
      setReviews(revs);
      if (prod?.product_type) {
        getProducts({ product_type: prod.product_type, limit: 5 }).then((rel) =>
          setRelated(rel.filter((r) => r.id !== prod.id).slice(0, 3))
        );
      }
      setLoading(false);
    });
  }, [slug]);

  const handleBuy = () => {
    if (!user) {
      navigate(`/auth/sign-in?redirect=/products/${slug}`);
      return;
    }
    if (!product) return;
    navigate(`/checkout?type=product&product_id=${product.id}&amount=${product.price}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nuvia-ivory pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nuvia-forest/20 border-t-nuvia-espresso rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-nuvia-ivory pt-24 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-2xl text-nuvia-espresso">Product not found</p>
        <Link to="/marketplace" className="btn-primary">Back to Marketplace</Link>
      </div>
    );
  }

  const images = product.images?.map((i) => i.url) ??
    (product.primary_image_url ? [product.primary_image_url] : []);

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
      {/* DM nudge banner */}
      <div className="bg-nuvia-beige-light/70 border-b border-nuvia-surface/60">
        <div className="nuvia-container py-2.5 flex items-center justify-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-nuvia-moss flex-shrink-0" />
          <p className="text-xs sm:text-sm text-nuvia-brown text-center">
            Can't find the web/order you seek?{" "}
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

      {/* Back nav */}
      <div className="border-b border-nuvia-surface/60">
        <div className="nuvia-container py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-nuvia-brown hover:text-nuvia-ink transition-colors group"
          >
            <span className="w-7 h-7 rounded-full glass-chip flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            Back
          </button>
        </div>
      </div>

      <div className="nuvia-container py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Left: Gallery */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <ImageGallery images={images} alt={product.name} />
            ) : (
              <BrowserMockup
                imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop"
                alt={product.name}
                aspectRatio="4/3"
              />
            )}

            {/* Video demo button (below gallery on mobile) */}
            {product.video_url && (
              <button
                onClick={() => setVideoOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-nuvia-forest text-nuvia-ivory rounded-xl hover:bg-nuvia-forest-dark transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-nuvia-ivory/20 flex items-center justify-center group-hover:bg-nuvia-ivory/30 transition-all">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-medium text-sm">Watch Live Demo</span>
                <MonitorPlay className="w-4 h-4 opacity-70" />
              </button>
            )}
          </div>

          {/* Right: Info */}
          <div className="lg:sticky lg:top-24 self-start space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.category && (
                  <Link
                    to={`/marketplace?category=${product.category.slug}`}
                    className="text-xs font-medium text-nuvia-brown uppercase tracking-wider hover:text-nuvia-espresso transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
                <span className="text-nuvia-surface-2 text-xs">·</span>
                <span
                  className={`badge-nuvia border text-xs ${
                    product.product_type === "app"
                      ? "bg-nuvia-sage/15 text-nuvia-moss border-nuvia-sage/40"
                      : "bg-nuvia-surface text-nuvia-brown border-nuvia-surface-2"
                  }`}
                >
                  {product.product_type === "app" ? "Application" : "Website"}
                </span>
                <span className="badge-nuvia-success text-xs">
                  Full Ownership
                </span>
                {product.is_featured && (
                  <span className="badge-nuvia bg-nuvia-forest text-nuvia-ivory text-xs">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl text-nuvia-ink font-bold leading-tight mb-3">
                {product.name}
              </h1>

              {product.overview && (
                <p className="text-nuvia-brown leading-relaxed text-base sm:text-lg">
                  {product.overview}
                </p>
              )}
            </div>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.average_rating} size="md" />
                <span className="text-sm font-medium text-nuvia-espresso">
                  {product.average_rating.toFixed(1)}
                </span>
                <span className="text-sm text-nuvia-brown">
                  ({product.review_count} review{product.review_count !== 1 ? "s" : ""})
                </span>
              </div>
            )}

              {/* Ownership price panel */}
              <div className="glass rounded-2xl p-4 sm:p-5 relative overflow-hidden light-streak">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-nuvia-moss font-bold uppercase tracking-[0.14em] mb-1">
                      Full Ownership Purchase
                    </p>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-nuvia-ink">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    <p className="text-xs text-nuvia-brown mt-1">
                      One-time payment · You own this {product.product_type} outright
                    </p>
                  </div>
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest hidden sm:flex items-center justify-center flex-shrink-0 shadow-nuvia-md">
                    <CheckCircle className="w-6 h-6 text-nuvia-champagne" />
                  </span>
                </div>
              </div>

            {/* Features (first 6) */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-sans font-semibold text-nuvia-espresso text-xs uppercase tracking-wider mb-3">
                  What's included
                </h3>
                <ul className="space-y-2">
                  {product.features.slice(0, 6).map((f) => (
                    <li key={f.id} className="flex items-start gap-2.5 text-sm text-nuvia-brown">
                      <CheckCircle className="w-4 h-4 text-nuvia-moss flex-shrink-0 mt-0.5" />
                      {f.feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={handleBuy}
                className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Own this {product.product_type} — {formatPrice(product.price, product.currency)}
              </button>

              {/* Video demo button (visible in sidebar on desktop) */}
              {product.video_url && (
                <button
                  onClick={() => setVideoOpen(true)}
                  className="hidden lg:flex w-full items-center justify-center gap-2.5 px-5 py-3 bg-nuvia-forest/8 text-nuvia-espresso border border-nuvia-surface-2 rounded-full hover:bg-nuvia-forest/15 hover:border-nuvia-forest/30 transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-nuvia-forest/10 flex items-center justify-center group-hover:bg-nuvia-forest/20">
                    <Play className="w-3 h-3 fill-nuvia-forest" />
                  </div>
                  <span className="font-medium text-sm">Watch Live Demo</span>
                </button>
              )}

              {product.demo_url && (
                <a
                  href={product.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-sm py-3 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> View Live Site
                </a>
              )}

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full text-sm py-2.5 flex items-center justify-center gap-2 text-nuvia-brown"
              >
                <MessageCircle className="w-4 h-4" /> Ask a question
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <RevealAnimation>
            <div className="max-w-3xl mb-14 sm:mb-16">
              <h2 className="font-display text-2xl text-nuvia-espresso mb-6">About this product</h2>
              <div className="space-y-4">
                {product.description.split("\n\n").map((para, i) => (
                  <p key={i} className="text-nuvia-brown leading-relaxed text-base">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </RevealAnimation>
        )}

        {/* All Features */}
        {product.features && product.features.length > 0 && (
          <RevealAnimation>
            <div className="mb-14 sm:mb-16">
              <h2 className="font-display text-2xl text-nuvia-espresso mb-6">
                All Features
                <span className="ml-2 text-base font-sans font-normal text-nuvia-brown">
                  ({product.features.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                {product.features.map((f) => (
                  <div key={f.id} className="flex items-start gap-2.5 text-sm text-nuvia-brown">
                    <CheckCircle className="w-4 h-4 text-nuvia-moss flex-shrink-0 mt-0.5" />
                    {f.feature}
                  </div>
                ))}
              </div>
            </div>
          </RevealAnimation>
        )}

        {/* Reviews */}
        <RevealAnimation>
          <div className="mb-14 sm:mb-16">
            <h2 className="font-display text-2xl text-nuvia-espresso mb-6">
              Customer Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-lg font-sans font-normal text-nuvia-brown">
                  ({reviews.length})
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <div className="card-nuvia rounded-2xl p-8 text-center">
                <p className="text-nuvia-brown">
                  No reviews yet. Be the first to review after purchasing.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="card-nuvia rounded-2xl p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div>
                        <StarRating rating={review.rating} size="sm" />
                        {review.title && (
                          <h4 className="font-medium text-nuvia-espresso mt-1 text-sm">
                            {review.title}
                          </h4>
                        )}
                      </div>
                      <span className="text-xs text-nuvia-brown flex-shrink-0">
                        {formatRelativeDate(review.created_at)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-nuvia-brown leading-relaxed">{review.comment}</p>
                    )}
                    <p className="text-xs text-nuvia-brown/60 mt-3">
                      {review.profile?.full_name || review.profile?.username || "Verified Customer"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </RevealAnimation>

        {/* Related */}
        {related.length > 0 && (
          <RevealAnimation>
            <div>
              <h2 className="font-display text-2xl text-nuvia-espresso mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </RevealAnimation>
        )}
      </div>

      {/* Video Modal */}
      {product.video_url && (
        <VideoModal
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          url={product.video_url}
          title={product.name}
        />
      )}
    </div>
  );
}
