import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, MessageCircle, ExternalLink, Play,
  MonitorPlay, RefreshCw, Calendar,
} from "lucide-react";
import ImageGallery from "@/components/features/ImageGallery";
import BrowserMockup from "@/components/features/BrowserMockup";
import StarRating from "@/components/features/StarRating";
import RevealAnimation from "@/components/features/RevealAnimation";
import VideoModal from "@/components/features/VideoModal";
import { getRentalProductBySlug } from "@/services/rentalService";
import type { RentalProduct, RentalPlan } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { WHATSAPP_URL } from "@/constants";

const PLANS: { key: RentalPlan; label: string; sublabel: string }[] = [
  { key: "1month", label: "1 Month", sublabel: "Short-term access" },
  { key: "3months", label: "3 Months", sublabel: "Best for projects" },
  { key: "1year", label: "1 Year", sublabel: "Best value" },
];

export default function RentalProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<RentalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<RentalPlan>("1month");
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getRentalProductBySlug(slug).then((p) => { setProduct(p); setLoading(false); });
  }, [slug]);

  const planPrice = (p: RentalProduct): Record<RentalPlan, number> => ({
    "1month": p.price_1month,
    "3months": p.price_3months,
    "1year": p.price_1year,
  });

  const handleRent = () => {
    if (!user) {
      navigate(`/auth/sign-in?redirect=/rent/${slug}`);
      return;
    }
    if (!product) return;
    const price = planPrice(product)[selectedPlan];
    navigate(`/checkout?type=rental&rental_product_id=${product.id}&rental_plan=${selectedPlan}&amount=${price}`);
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
        <p className="font-display text-2xl text-nuvia-espresso">Rental product not found</p>
        <Link to="/rent" className="btn-primary">Back to Rentals</Link>
      </div>
    );
  }

  const images = product.images?.map((i) => i.url) ?? (product.primary_image_url ? [product.primary_image_url] : []);
  const prices = planPrice(product);

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
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
            Back to Rentals
          </button>
        </div>
      </div>

      <div className="nuvia-container py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Gallery */}
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
            {product.video_url && (
              <button
                onClick={() => setVideoOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-nuvia-forest text-nuvia-ivory rounded-xl hover:bg-nuvia-forest-dark transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-nuvia-ivory/20 flex items-center justify-center group-hover:bg-nuvia-ivory/30">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-medium text-sm">Watch Live Demo</span>
                <MonitorPlay className="w-4 h-4 opacity-70" />
              </button>
            )}
          </div>

          {/* Info + pricing */}
          <div className="lg:sticky lg:top-24 self-start space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.category && (
                  <span className="text-xs font-medium text-nuvia-brown uppercase tracking-wider">
                    {product.category.name}
                  </span>
                )}
                <span className="text-nuvia-surface-2 text-xs">·</span>
                <span className="badge-nuvia bg-nuvia-surface/60 text-nuvia-brown border border-nuvia-surface-2 text-xs capitalize">
                  {product.product_type}
                </span>
                <span className="badge-nuvia bg-nuvia-forest/10 text-nuvia-espresso border border-nuvia-forest/20 text-xs">
                  <RefreshCw className="w-2.5 h-2.5 inline mr-1" />Rental
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-nuvia-espresso leading-tight mb-3">{product.name}</h1>
              {product.overview && (
                <p className="text-nuvia-brown leading-relaxed text-base sm:text-lg">{product.overview}</p>
              )}
            </div>

            {product.review_count > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.average_rating} size="md" />
                <span className="text-sm font-medium text-nuvia-espresso">{product.average_rating.toFixed(1)}</span>
                <span className="text-sm text-nuvia-brown">({product.review_count} reviews)</span>
              </div>
            )}

            {/* Plan selector */}
            <div className="glass rounded-2xl p-4 sm:p-5 light-streak">
              <p className="text-xs font-bold text-nuvia-brown uppercase tracking-[0.12em] mb-3">
                <Calendar className="w-3 h-3 inline mr-1" />Choose a rental plan
              </p>
              <div className="space-y-2">
                {PLANS.map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      selectedPlan === plan.key
                        ? "border-nuvia-forest bg-nuvia-forest text-nuvia-ivory"
                        : "border-nuvia-surface bg-nuvia-ivory text-nuvia-espresso hover:border-nuvia-brown"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{plan.label}</p>
                      <p className={`text-xs mt-0.5 ${selectedPlan === plan.key ? "text-nuvia-ivory/70" : "text-nuvia-brown"}`}>
                        {plan.sublabel}
                      </p>
                    </div>
                    <p className="font-display text-lg font-bold">{formatPrice(prices[plan.key])}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Features preview */}
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

            {/* Rental notice */}
            <div className="bg-nuvia-sage/15 border border-nuvia-sage/40 rounded-xl p-4">
              <p className="text-xs font-medium text-nuvia-moss mb-1">Rental — No Source Code</p>
              <p className="text-xs text-nuvia-moss">
                This is a rental plan. You receive access to the hosted website or app for the rental period. 
                Source code and full ownership are not included.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={handleRent}
                className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Rent — {formatPrice(prices[selectedPlan])}
              </button>
              {product.video_url && (
                <button
                  onClick={() => setVideoOpen(true)}
                  className="hidden lg:flex w-full items-center justify-center gap-2.5 px-5 py-3 bg-nuvia-forest/8 text-nuvia-espresso border border-nuvia-surface-2 rounded-full hover:bg-nuvia-forest/15 hover:border-nuvia-forest/30 transition-all group"
                >
                  <Play className="w-3 h-3 fill-nuvia-forest" />
                  <span className="font-medium text-sm">Watch Live Demo</span>
                </button>
              )}
              {product.demo_url && (
                <a href={product.demo_url} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary w-full text-sm py-3 flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" /> View Live Site
                </a>
              )}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="btn-ghost w-full text-sm py-2.5 flex items-center justify-center gap-2 text-nuvia-brown">
                <MessageCircle className="w-4 h-4" /> Ask a question
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <RevealAnimation>
            <div className="max-w-3xl mb-14">
              <h2 className="font-display text-2xl text-nuvia-espresso mb-6">About this rental</h2>
              <div className="space-y-4">
                {product.description.split("\n\n").map((para, i) => (
                  <p key={i} className="text-nuvia-brown leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          </RevealAnimation>
        )}

        {/* All features */}
        {product.features && product.features.length > 0 && (
          <RevealAnimation>
            <div className="mb-14">
              <h2 className="font-display text-2xl text-nuvia-espresso mb-6">
                All Features <span className="text-base font-sans font-normal text-nuvia-brown">({product.features.length})</span>
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
      </div>

      {product.video_url && (
        <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} url={product.video_url} title={product.name} />
      )}
    </div>
  );
}
