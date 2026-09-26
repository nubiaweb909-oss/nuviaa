import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, Gem, Shield, MessageCircle, ChevronRight,
  Store, Briefcase, ShoppingBag, Palette, Building2, UtensilsCrossed,
  Newspaper, Cloud, Plane, Shirt, HeartPulse, GraduationCap, Sparkles, LayoutGrid,
} from "lucide-react";
import ProductCard from "@/components/features/ProductCard";
import DomainSearchBar from "@/components/features/DomainSearchBar";
import RevealAnimation from "@/components/features/RevealAnimation";
import StarRating from "@/components/features/StarRating";
import HeroShowcase from "@/components/features/HeroShowcase";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import type { Product, Category } from "@/types";
import { HOW_IT_WORKS, TESTIMONIALS } from "@/constants";
import travelLandscape from "@/assets/travel-landscape.jpg";
import luneraScene from "@/assets/lunera-scene.jpg";

/* Presentation-only icon mapping for dynamic categories.
   Categories themselves always come from the database. */
const CATEGORY_ICON_HINTS: [RegExp, typeof Briefcase][] = [
  [/business|corporate|agency/i, Briefcase],
  [/shop|commerce|store|market/i, ShoppingBag],
  [/portfolio|creative|design|art/i, Palette],
  [/real\s?estate|property|architecture|construction/i, Building2],
  [/restaurant|food|cafe|hotel/i, UtensilsCrossed],
  [/blog|news|magazine|media/i, Newspaper],
  [/saas|dashboard|tech|startup/i, Cloud],
  [/travel|tour|trip/i, Plane],
  [/fashion|clothing|apparel|beauty/i, Shirt],
  [/health|fitness|medical|wellness/i, HeartPulse],
  [/education|school|course|learning/i, GraduationCap],
];

function categoryIcon(name: string) {
  const hint = CATEGORY_ICON_HINTS.find(([re]) => re.test(name));
  return hint ? hint[1] : LayoutGrid;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [websites, setWebsites] = useState<Product[]>([]);
  const [apps, setApps] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      getProducts({ is_featured: true, limit: 3 }),
      getProducts({ product_type: "website", limit: 4 }),
      getProducts({ product_type: "app", limit: 4 }),
      getCategories(),
    ]).then(([feat, webs, aps, cats]) => {
      setFeatured(feat);
      setWebsites(webs);
      setApps(aps);
      setCategories(cats);
      setProductsLoaded(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-nuvia-ivory overflow-x-safe">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-nuvia-hero overflow-hidden">
        {/* soft grain */}
        <div aria-hidden className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
        <div className="nuvia-container relative">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-8 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 glass-chip rounded-full text-xs font-semibold text-nuvia-brown mb-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-nuvia-champagne inline-block" />
                  Premium Digital Marketplace
                </span>
                <h1 className="font-display text-[2.6rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem] xl:text-6xl text-nuvia-ink font-bold tracking-tight mb-6 text-balance">
                  Step into a showroom of{" "}
                  <span className="text-champagne-gradient">beautiful websites.</span>
                </h1>
                <p className="text-base md:text-lg text-nuvia-brown leading-relaxed mb-9 max-w-lg">
                  Discover premium, ready-to-use websites and applications — fully built,
                  production-ready, and waiting for their next owner. Preview every
                  product like it's already yours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5">
                  <Link to="/marketplace" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                    Explore Marketplace <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/domains" className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                    Find Your Domain
                  </Link>
                </div>

                {/* Social proof */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-11">
                  <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                    <p className="font-display text-2xl font-bold text-nuvia-ink">∞</p>
                    <p className="text-xs text-nuvia-brown leading-tight">Premium<br />Products</p>
                  </div>
                  <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                    <p className="font-display text-2xl font-bold text-nuvia-ink">8</p>
                    <p className="text-xs text-nuvia-brown leading-tight">Domain<br />Extensions</p>
                  </div>
                  <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2.5">
                    <StarRating rating={5} size="sm" />
                    <p className="text-xs text-nuvia-brown">4.8 avg rating</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Hero 3D showcase */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <HeroShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products — only shown when admin has published products */}
      {productsLoaded && featured.length === 0 && websites.length === 0 && apps.length === 0 && (
        <section className="py-16 md:py-24 bg-nuvia-ivory">
          <div className="nuvia-container">
            <RevealAnimation>
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-5">
                  <Store className="w-7 h-7 text-nuvia-moss" />
                </div>
                <h2 className="font-display text-2xl text-nuvia-ink mb-3">Products coming soon</h2>
                <p className="text-nuvia-brown text-sm leading-relaxed mb-6">
                  Our catalogue is being curated. Check back shortly — or browse domains while you wait.
                </p>
                <Link to="/domains" className="btn-secondary inline-flex items-center gap-2">
                  Explore Domains
                </Link>
              </div>
            </RevealAnimation>
          </div>
        </section>
      )}

      {productsLoaded && featured.length > 0 && (
        <section className="py-16 md:py-24 bg-nuvia-ivory">
          <div className="nuvia-container">
            <RevealAnimation>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="eyebrow mb-2"><Sparkles className="w-3.5 h-3.5" /> Handpicked Selection</p>
                  <h2 className="section-heading">Featured Products</h2>
                </div>
                <Link to="/marketplace?featured=true" className="btn-ghost flex items-center gap-1 text-sm hidden sm:flex">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── The Showroom — immersive dark band ───────────────────── */}
      <section className="relative py-20 md:py-28 bg-nuvia-dark overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-nuvia-forest/40 blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-nuvia-champagne/10 blur-[120px]" />
        </div>
        <div className="nuvia-container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Layered visuals */}
            <RevealAnimation direction="right" className="relative order-2 lg:order-1">
              <div className="relative perspective-1200">
                <div className="glass-frame !p-2 rotate-[-2.5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                  <img
                    src={travelLandscape}
                    alt="Immersive website experience"
                    className="w-full h-auto rounded-[0.9rem] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-2 rounded-[0.9rem] bg-gradient-to-tr from-nuvia-forest/40 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Floating glass overlay panel */}
                <div className="absolute -bottom-6 -right-2 sm:right-6 glass-chip rounded-2xl px-4 py-3 backdrop-blur-xl max-w-[220px]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-nuvia-champagne mb-1">Rental Library</p>
                  <p className="text-sm font-bold text-white leading-snug">Premium sites, flexible monthly plans</p>
                </div>
              </div>
            </RevealAnimation>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <RevealAnimation>
                <p className="inline-flex items-center gap-2 text-xs font-bold text-nuvia-champagne uppercase tracking-[0.16em] mb-4">
                  <span className="w-6 h-px bg-nuvia-champagne/60 inline-block" /> The Nuvia Showroom
                </p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-nuvia-ivory leading-[1.12] mb-5 text-balance">
                  Websites as the main attraction — not the interface around them.
                </h2>
                <p className="text-nuvia-surface-2 leading-relaxed mb-8 max-w-lg">
                  Every listing is presented the way it deserves: full-bleed previews,
                  live demos and glass-framed galleries, so you can see exactly what
                  you're getting before you own it.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5">
                  <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-nuvia-ivory text-nuvia-ink rounded-full font-bold text-sm hover:bg-nuvia-cream transition-all hover:-translate-y-0.5">
                    Browse the Collection <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/rent" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 glass-dark rounded-full font-semibold text-sm text-nuvia-ivory hover:border-nuvia-champagne/40 transition-all">
                    Rent Instead
                  </Link>
                </div>
              </RevealAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Search */}
      <section className="py-16 md:py-24 bg-nuvia-cream">
        <div className="nuvia-container">
          <div className="max-w-3xl mx-auto text-center">
            <RevealAnimation>
              <p className="eyebrow justify-center mb-2">Domain Names</p>
              <h2 className="section-heading mb-4">Find your perfect domain</h2>
              <p className="section-subheading mb-10">
                Search for your ideal domain name. We offer manually fulfilled domain registrations at competitive prices.
              </p>
            </RevealAnimation>
            <RevealAnimation delay={0.1}>
              <DomainSearchBar large placeholder="Search for your domain (e.g. nubia)" />
            </RevealAnimation>
          </div>
        </div>
      </section>

      {/* Websites Section */}
      {productsLoaded && websites.length > 0 && (
        <section className="py-16 md:py-24 bg-nuvia-ivory">
          <div className="nuvia-container">
            <RevealAnimation>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="eyebrow mb-2">Website Templates</p>
                  <h2 className="section-heading">Premium Websites</h2>
                </div>
                <Link to="/marketplace?type=website" className="btn-ghost flex items-center gap-1 text-sm hidden sm:flex">
                  All Websites <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {websites.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Apps Section */}
      {productsLoaded && apps.length > 0 && (
        <section className="py-16 md:py-24 bg-nuvia-cream">
          <div className="nuvia-container">
            <RevealAnimation>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="eyebrow mb-2">Applications</p>
                  <h2 className="section-heading">Full-Stack Applications</h2>
                </div>
                <Link to="/marketplace?type=app" className="btn-ghost flex items-center gap-1 text-sm hidden sm:flex">
                  All Apps <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {apps.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {productsLoaded && categories.length > 0 && (
        <section className="py-16 md:py-24 bg-nuvia-ivory">
          <div className="nuvia-container">
            <RevealAnimation>
              <div className="text-center mb-12">
                <p className="eyebrow justify-center mb-2">Browse by Type</p>
                <h2 className="section-heading">Find what you need</h2>
              </div>
            </RevealAnimation>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => {
                const Icon = categoryIcon(cat.name);
                return (
                  <RevealAnimation key={cat.id} delay={i * 0.05}>
                    <Link
                      to={`/marketplace?category=${cat.slug}`}
                      className="group glass rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-nuvia-md hover:-translate-y-0.5 hover:bg-nuvia-beige-light/40 transition-all duration-300"
                    >
                      <span className="w-11 h-11 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center shadow-nuvia-sm group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-nuvia-champagne" />
                      </span>
                      <p className="font-display text-sm md:text-base font-semibold text-nuvia-ink">{cat.name}</p>
                    </Link>
                  </RevealAnimation>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-nuvia-cream relative overflow-hidden" id="how-it-works">
        <div aria-hidden className="absolute top-0 right-0 w-96 h-96 rounded-full bg-nuvia-sage-light/25 blur-[130px] pointer-events-none" />
        <div className="nuvia-container relative">
          <RevealAnimation>
            <div className="text-center mb-16">
              <p className="eyebrow justify-center mb-2">Simple Process</p>
              <h2 className="section-heading">How Nuvia works</h2>
            </div>
          </RevealAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <RevealAnimation key={step.step} delay={i * 0.08}>
                <div className="relative">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-nuvia-surface-2/70 to-transparent z-0" style={{ width: "calc(100% - 3rem)", left: "3rem" }} />
                  )}
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-5">
                      <span className="font-display text-nuvia-forest text-base font-bold">{step.step}</span>
                    </div>
                    <h3 className="font-display text-lg text-nuvia-ink mb-3">{step.title}</h3>
                    <p className="text-sm text-nuvia-brown leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Why Nuvia */}
      <section className="py-16 md:py-24 bg-nuvia-ivory">
        <div className="nuvia-container">
          <RevealAnimation>
            <div className="text-center mb-16">
              <p className="eyebrow justify-center mb-2">The Nuvia Standard</p>
              <h2 className="section-heading">Why choose Nuvia?</h2>
            </div>
          </RevealAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Ready to Launch", desc: "Save months of development time with professionally built products." },
              { icon: Gem, title: "Premium Quality", desc: "Every product is crafted to the highest design and engineering standards." },
              { icon: Shield, title: "Secure Payments", desc: "Bank-grade security via Flutterwave. Your data stays private." },
              { icon: MessageCircle, title: "Expert Support", desc: "Direct WhatsApp and Telegram access to our team." },
            ].map((item, i) => (
              <RevealAnimation key={item.title} delay={i * 0.08}>
                <div className="glass rounded-2xl p-6 h-full hover:shadow-nuvia-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-nuvia-forest/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-nuvia-forest" />
                  </div>
                  <h3 className="font-display text-lg text-nuvia-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-nuvia-brown leading-relaxed">{item.desc}</p>
                </div>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-nuvia-beige-light/60 relative overflow-hidden">
        <div aria-hidden className="absolute top-0 left-1/3 w-80 h-80 rounded-full bg-nuvia-champagne/25 blur-[130px] pointer-events-none" />
        <div className="nuvia-container relative">
          <RevealAnimation>
            <div className="text-center mb-16">
              <p className="eyebrow justify-center mb-2">Customer Stories</p>
              <h2 className="section-heading">What our customers say</h2>
            </div>
          </RevealAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <RevealAnimation key={t.id} delay={i * 0.1}>
                <div className="glass rounded-3xl p-7 h-full flex flex-col hover:shadow-nuvia-md transition-all duration-300">
                  <StarRating rating={t.rating} className="mb-4" />
                  <p className="text-sm text-nuvia-ink/80 leading-relaxed italic mb-6 flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-nuvia-surface/50">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-nuvia-champagne/50" />
                    <div>
                      <p className="font-semibold text-nuvia-ink text-sm">{t.name}</p>
                      <p className="text-xs text-nuvia-brown">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 bg-nuvia-dark overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-nuvia-forest/35 blur-[130px]" />
        </div>
        <div className="nuvia-container text-center relative">
          <RevealAnimation>
            <div className="max-w-3xl mx-auto relative">
              {/* Lunera scene as a subtle tilted accent behind glass panel */}
              <div className="absolute -top-10 -right-16 xl:-right-28 w-48 xl:w-64 opacity-60 hidden lg:block rotate-6 pointer-events-none">
                <div className="glass rounded-2xl p-1.5">
                  <img src={luneraScene} alt="" aria-hidden className="rounded-xl w-full h-auto" loading="lazy" />
                </div>
              </div>
              <div className="glass-dark rounded-[2rem] p-10 md:p-14 light-streak">
                <h2 className="font-display text-3xl md:text-5xl text-nuvia-ivory font-bold mb-4 text-balance">
                  Ready to launch your next product?
                </h2>
                <p className="text-nuvia-surface-2 text-lg mb-9 max-w-xl mx-auto">
                  Browse our full catalogue of premium digital products and find the perfect foundation for your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-nuvia-ivory text-nuvia-ink rounded-full font-bold hover:bg-nuvia-cream transition-all hover:-translate-y-0.5">
                    Explore Marketplace <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/domains" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-nuvia-champagne/35 text-nuvia-champagne rounded-full font-semibold hover:bg-nuvia-champagne/10 transition-all">
                    Find a Domain
                  </Link>
                </div>
              </div>
            </div>
          </RevealAnimation>
        </div>
      </section>
    </div>
  );
}
