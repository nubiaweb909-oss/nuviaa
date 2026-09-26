import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import RevealAnimation from "@/components/features/RevealAnimation";
import { HOW_IT_WORKS, WHY_NUVIA } from "@/constants";
import { Zap, Gem, Shield, MessageCircle } from "lucide-react";
import luneraScene from "@/assets/lunera-scene.jpg";

const ICONS = { Zap, Gem, Shield, MessageCircle };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
      {/* Hero */}
      <section className="bg-nuvia-hero py-24 md:py-32 relative overflow-hidden border-b border-nuvia-surface/50">
        <div aria-hidden className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
        <div className="nuvia-container relative">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="eyebrow mb-3">About Nuvia</p>
              <h1 className="font-display text-4xl md:text-6xl text-nuvia-ink font-bold mb-6 text-balance">
                Premium digital products,{" "}
                <span className="text-champagne-gradient">built to last.</span>
              </h1>
              <p className="text-nuvia-brown text-lg leading-relaxed max-w-2xl">
                Nuvia is a curated marketplace for professionally designed and engineered websites, applications, and domain names. We believe every business deserves access to exceptional digital products without the months of development time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-nuvia-ivory">
        <div className="nuvia-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <RevealAnimation>
              <div>
                <p className="eyebrow mb-3">Our Mission</p>
                <h2 className="font-display text-3xl text-nuvia-ink font-bold mb-5">
                  Giving businesses a head start
                </h2>
                <p className="text-nuvia-brown leading-relaxed mb-4">
                  Every product in the Nuvia marketplace is designed with a single goal in mind: to give your business the best possible digital foundation from day one.
                </p>
                <p className="text-nuvia-brown leading-relaxed mb-6">
                  We handpick and review every product to ensure it meets our standards for design quality, code integrity, and business practicality. No generic templates. No compromise.
                </p>
                <Link to="/marketplace" className="btn-primary flex items-center gap-2 w-fit">
                  Explore the Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealAnimation>
            <RevealAnimation delay={0.1} direction="right">
              <div className="relative">
                <div className="glass-frame rotate-[1.5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                  <img src={luneraScene} alt="Nuvia showcase design" className="w-full h-auto rounded-[0.9rem] object-cover" loading="lazy" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="font-display text-3xl font-bold text-nuvia-forest mb-1">9+</p>
                    <p className="text-nuvia-brown text-xs">Premium Products</p>
                  </div>
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="font-display text-3xl font-bold text-nuvia-forest mb-1">8</p>
                    <p className="text-nuvia-brown text-xs">Domain Extensions</p>
                  </div>
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="font-display text-3xl font-bold text-nuvia-forest mb-1">4.8</p>
                    <p className="text-nuvia-brown text-xs">Average Rating</p>
                  </div>
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="font-display text-3xl font-bold text-nuvia-forest mb-1">24h</p>
                    <p className="text-nuvia-brown text-xs">Delivery Time</p>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-nuvia-cream">
        <div className="nuvia-container">
          <RevealAnimation>
            <div className="text-center mb-16">
              <p className="eyebrow justify-center mb-2">Process</p>
              <h2 className="section-heading">How Nuvia works</h2>
            </div>
          </RevealAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <RevealAnimation key={step.step} delay={i * 0.08}>
                <div className="glass rounded-2xl p-6 hover:shadow-nuvia-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center mb-4 shadow-nuvia-sm">
                    <span className="font-display text-nuvia-champagne text-sm font-bold">{step.step}</span>
                  </div>
                  <h3 className="font-display text-lg text-nuvia-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-nuvia-brown leading-relaxed">{step.description}</p>
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
              <h2 className="section-heading">Why Nuvia stands apart</h2>
            </div>
          </RevealAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_NUVIA.map((item, i) => {
              const Icon = ICONS[item.icon as keyof typeof ICONS];
              return (
                <RevealAnimation key={item.title} delay={i * 0.08}>
                  <div className="glass rounded-2xl p-6 h-full hover:shadow-nuvia-md hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-nuvia-forest/10 flex items-center justify-center mb-4">
                      {Icon && <Icon className="w-5 h-5 text-nuvia-forest" />}
                    </div>
                    <h3 className="font-display text-lg text-nuvia-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-nuvia-brown leading-relaxed">{item.description}</p>
                  </div>
                </RevealAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-nuvia-dark relative overflow-hidden">
        <div aria-hidden className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-nuvia-forest/35 blur-[130px] pointer-events-none" />
        <div className="nuvia-container text-center relative">
          <RevealAnimation>
            <h2 className="font-display text-3xl md:text-4xl text-nuvia-ivory font-bold mb-4">Start building today</h2>
            <p className="text-nuvia-surface-2 mb-8 max-w-xl mx-auto">Browse our marketplace and find the perfect digital foundation for your next venture.</p>
            <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 bg-nuvia-ivory text-nuvia-ink rounded-full font-bold hover:bg-nuvia-cream transition-all hover:-translate-y-0.5">
              Explore Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </RevealAnimation>
        </div>
      </section>
    </div>
  );
}
