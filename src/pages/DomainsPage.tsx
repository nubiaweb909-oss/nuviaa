import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Shield, Headphones, Zap } from "lucide-react";
import DomainSearchBar from "@/components/features/DomainSearchBar";
import RevealAnimation from "@/components/features/RevealAnimation";
import { getDomainExtensions } from "@/services/domainService";
import type { DomainExtension } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function DomainsPage() {
  const [extensions, setExtensions] = useState<DomainExtension[]>([]);

  useEffect(() => {
    getDomainExtensions().then(setExtensions);
  }, []);

  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16">
      {/* Hero */}
      <section className="bg-nuvia-hero pt-20 pb-16 relative overflow-hidden border-b border-nuvia-surface/50">
        <div aria-hidden className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
        <div className="nuvia-container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass-chip rounded-full text-xs font-semibold text-nuvia-brown mb-5">
                <Globe className="w-3.5 h-3.5 text-nuvia-moss" /> Domain Marketplace
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-nuvia-ink font-bold mb-4 text-balance">
                Claim your place <span className="text-champagne-gradient">on the internet</span>
              </h1>
              <p className="text-nuvia-brown text-base md:text-lg mb-10 max-w-xl mx-auto">
                Search for your ideal domain name. All domains are manually registered and set up by our team.
              </p>
              <DomainSearchBar large placeholder="Enter your domain name (e.g. nubia or nubia.com)" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extensions Pricing */}
      <section className="py-16 md:py-24 bg-nuvia-ivory">
        <div className="nuvia-container">
          <RevealAnimation>
            <div className="text-center mb-12">
              <p className="eyebrow justify-center mb-2">Pricing</p>
              <h2 className="section-heading">Available Extensions</h2>
              <p className="section-subheading mt-3 max-w-xl mx-auto">
                Transparent annual pricing. All extensions are manually registered and configured by the Nuvia team.
              </p>
            </div>
          </RevealAnimation>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {extensions.map((ext, i) => (
              <RevealAnimation key={ext.id} delay={i * 0.05}>
                <div className="glass rounded-2xl p-5 text-center hover:shadow-nuvia-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <p className="font-display text-2xl font-bold text-nuvia-forest mb-2">{ext.extension}</p>
                  <p className="font-bold text-lg text-nuvia-ink">{formatPrice(ext.price)}</p>
                  <p className="text-xs text-nuvia-brown mt-1">/year</p>
                  {ext.description && (
                    <p className="text-xs text-nuvia-brown mt-2 leading-relaxed">{ext.description}</p>
                  )}
                </div>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* How Domain Fulfillment Works */}
      <section className="py-16 md:py-20 bg-nuvia-beige-light">
        <div className="nuvia-container">
          <RevealAnimation>
            <div className="text-center mb-12">
              <h2 className="section-heading">How domain registration works</h2>
            </div>
          </RevealAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Globe,
                step: "01",
                title: "Search & Select",
                desc: "Enter your desired domain name. We display all available extensions with pricing.",
              },
              {
                icon: Shield,
                step: "02",
                title: "Secure Payment",
                desc: "Complete your purchase through our Flutterwave-secured checkout system.",
              },
              {
                icon: Headphones,
                step: "03",
                title: "Manual Setup",
                desc: "Our team registers and configures your domain. You receive all details via WhatsApp within 24 hours.",
              },
            ].map((item, i) => (
              <RevealAnimation key={item.step} delay={i * 0.1}>
                <div className="glass rounded-2xl p-6 text-center hover:shadow-nuvia-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center mx-auto mb-4 shadow-nuvia-sm">
                    <item.icon className="w-5 h-5 text-nuvia-champagne" />
                  </div>
                  <p className="text-xs font-semibold text-nuvia-brown uppercase tracking-[0.12em] mb-2">{item.step}</p>
                  <h3 className="font-display text-lg text-nuvia-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-nuvia-brown leading-relaxed">{item.desc}</p>
                </div>
              </RevealAnimation>
            ))}
          </div>

          <RevealAnimation delay={0.3}>
            <div className="mt-10 max-w-2xl mx-auto bg-nuvia-champagne/20 border border-nuvia-champagne/50 rounded-2xl p-5 text-center">
              <p className="text-sm font-medium text-[#7A5A2E] mb-1">Important Notice</p>
              <p className="text-xs text-[#7A5A2E]">
                Nuvia's domain marketplace is a manually fulfilled service. We do not use automated domain registrar APIs. All domains are registered and configured by our team within 24 hours of payment confirmation.
              </p>
            </div>
          </RevealAnimation>
        </div>
      </section>

      {/* Why Register with Nuvia */}
      <section className="py-16 md:py-20 bg-nuvia-cream">
        <div className="nuvia-container">
          <RevealAnimation>
            <div className="text-center mb-12">
              <h2 className="section-heading">Why register with Nuvia?</h2>
            </div>
          </RevealAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, title: "Secure Payments", desc: "Flutterwave-secured transactions. Your payment is always protected." },
              { icon: Headphones, title: "Personal Support", desc: "Direct WhatsApp communication with our team for every order." },
              { icon: Zap, title: "Fast Turnaround", desc: "Domain setup completed within 24 hours of payment verification." },
              { icon: Globe, title: "Multiple Extensions", desc: "8 domain extensions available at competitive Nigerian market prices." },
            ].map((item, i) => (
              <RevealAnimation key={item.title} delay={i * 0.08}>
                <div className="flex gap-4 glass rounded-2xl p-5 hover:shadow-nuvia-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-nuvia-forest/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-nuvia-forest" />
                  </div>
                  <div>
                    <h3 className="font-display text-base text-nuvia-ink mb-1">{item.title}</h3>
                    <p className="text-sm text-nuvia-brown leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
