import { motion } from "framer-motion";
import { Check } from "lucide-react";
import weatherImg from "@/assets/showcase-weather.jpg";
import luneraCardsImg from "@/assets/lunera-cards.jpg";
import travelCardImg from "@/assets/travel-card.jpg";

/**
 * AuthShell — shared split-screen glass layout for authentication pages.
 * Left: layered showroom imagery (visual assets only). Right: the form card.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-nuvia-hero pt-16 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-nuvia-sage-light/30 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-nuvia-champagne/25 blur-[110px] pointer-events-none" />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px] gap-10 xl:gap-14 items-center relative">
        {/* Left visual — desktop only */}
        <div className="hidden lg:block relative min-h-[520px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-4 w-[78%]"
          >
            <div className="glass-frame rotate-[-2deg]">
              <img
                src={weatherImg}
                alt="Beautiful website preview"
                className="w-full h-auto rounded-[0.9rem] object-cover"
                loading="eager"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 8 }}
            animate={{ opacity: 1, y: 0, rotate: 5 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 w-[38%]"
          >
            <div className="glass rounded-2xl p-1.5 animate-float-soft">
              <img src={luneraCardsImg} alt="" aria-hidden className="rounded-xl w-full h-auto object-cover" loading="lazy" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-[6%] bottom-3 w-[27%]"
          >
            <div className="glass rounded-2xl p-1.5 animate-float">
              <img src={travelCardImg} alt="" aria-hidden className="rounded-xl w-full h-auto object-cover" loading="lazy" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="absolute left-8 bottom-8 max-w-[300px]"
          >
            <p className="font-display text-3xl font-bold text-nuvia-ink leading-tight mb-4 text-balance">
              Your showroom seat is waiting.
            </p>
            <ul className="space-y-2.5">
              {["Premium, production-ready products", "Secure Flutterwave checkout", "Full ownership or flexible rentals"].map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-nuvia-brown font-medium">
                  <span className="w-5 h-5 rounded-full bg-nuvia-forest flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-nuvia-champagne" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Right — form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
