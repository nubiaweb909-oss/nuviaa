import { Link } from "react-router-dom";
import { MessageCircle, Mail } from "lucide-react";
import { WHATSAPP_URL } from "@/constants";

export default function Footer() {
  return (
    <footer className="relative bg-nuvia-dark text-nuvia-surface overflow-hidden">
      {/* Soft botanical glow accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-nuvia-forest/30 blur-[120px]" />
        <div className="absolute -bottom-40 right-10 w-80 h-80 rounded-full bg-nuvia-champagne/10 blur-[120px]" />
      </div>

      <div className="nuvia-container py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest border border-nuvia-sage-light/20 flex items-center justify-center">
                <span className="font-display text-nuvia-ivory text-sm font-bold">N</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-nuvia-champagne ring-2 ring-nuvia-ink/60" />
              </div>
              <span className="font-display text-xl font-bold text-nuvia-ivory">Nuvia</span>
            </div>
            <p className="text-sm text-nuvia-surface-2 leading-relaxed mb-6">
              Premium digital products built to move your business forward. Browse, preview and purchase professionally designed websites and applications.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-xl glass-dark hover:border-nuvia-champagne/40 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-nuvia-champagne" />
              </a>
              <a
                href="mailto:support@nuvia.store"
                className="flex items-center justify-center w-10 h-10 rounded-xl glass-dark hover:border-nuvia-champagne/40 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-nuvia-champagne" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-xs font-sans font-bold text-nuvia-champagne uppercase tracking-[0.14em] mb-4">Marketplace</h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", href: "/marketplace" },
                { label: "Websites", href: "/marketplace?type=website" },
                { label: "Applications", href: "/marketplace?type=app" },
                { label: "Domains", href: "/domains" },
                { label: "Featured", href: "/marketplace?featured=true" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-nuvia-surface-2 hover:text-nuvia-ivory transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-sans font-bold text-nuvia-champagne uppercase tracking-[0.14em] mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Nuvia", href: "/about" },
                { label: "How It Works", href: "/about#how-it-works" },
                { label: "Sign In", href: "/auth/sign-in" },
                { label: "Get Started", href: "/auth/sign-up" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-nuvia-surface-2 hover:text-nuvia-ivory transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-sans font-bold text-nuvia-champagne uppercase tracking-[0.14em] mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-nuvia-surface-2 hover:text-nuvia-ivory transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Support
                </a>
              </li>
              <li>
                <a href="mailto:support@nuvia.store" className="flex items-center gap-2 text-sm text-nuvia-surface-2 hover:text-nuvia-ivory transition-colors">
                  <Mail className="w-3.5 h-3.5" /> support@nuvia.store
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-nuvia-forest-light/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-nuvia-brown-light">
            © {new Date().getFullYear()} Nuvia. All rights reserved.
          </p>
          <p className="text-xs text-nuvia-brown-light">
            Premium Digital Marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}
