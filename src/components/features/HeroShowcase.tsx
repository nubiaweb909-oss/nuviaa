import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Star, Globe, ArrowUpRight } from "lucide-react";
import BrowserMockup from "./BrowserMockup";
import weatherImg from "@/assets/showcase-weather.jpg";
import travelCardImg from "@/assets/travel-card.jpg";
import luneraCardsImg from "@/assets/lunera-cards.jpg";

/**
 * HeroShowcase — layered 3D composition for the homepage hero.
 * The uploaded reference designs are used as showcase imagery inside
 * glass frames (they are visual assets, NOT marketplace products).
 * Cursor parallax on desktop; static, simplified stack on touch/reduced-motion.
 */
export default function HeroShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const finePointer =
    typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
  const parallax = finePointer && !reduceMotion;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.8 });

  // Different depths move at different speeds
  const mainX = useTransform(sx, [-1, 1], [-10, 10]);
  const mainY = useTransform(sy, [-1, 1], [-6, 6]);
  const backX = useTransform(sx, [-1, 1], [16, -16]);
  const backY = useTransform(sy, [-1, 1], [10, -10]);
  const frontX = useTransform(sx, [-1, 1], [-22, 22]);
  const frontY = useTransform(sy, [-1, 1], [-14, 14]);

  const handleMove = (e: React.MouseEvent) => {
    if (!parallax || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative mx-auto w-full max-w-[560px] lg:max-w-none h-[420px] sm:h-[480px] lg:h-[560px] perspective-1200 select-none"
    >
      {/* Ambient glow blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-2 w-64 h-64 rounded-full bg-nuvia-sage-light/45 blur-[90px]" />
        <div className="absolute bottom-0 left-2 w-72 h-72 rounded-full bg-nuvia-champagne/40 blur-[100px]" />
      </div>

      {/* Back layer — vertical glass stat panel (tilted, drifting) */}
      <div className="absolute top-2 right-0 sm:right-2 w-[150px] sm:w-[170px] z-10 hidden sm:block">
        <motion.div style={parallax ? { x: backX, y: backY } : undefined}>
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 8 }}
            animate={{ opacity: 1, y: 0, rotate: 6 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-1.5 animate-float-soft"
          >
            <img
              src={luneraCardsImg}
              alt="Glass interface panels"
              className="w-full h-auto rounded-xl object-cover"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Main layer — website preview in a glass browser frame */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[86%] sm:w-[78%] lg:w-[72%] z-20">
        <motion.div style={parallax ? { x: mainX, y: mainY } : undefined}>
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ rotate: 0, scale: 1.01 }}
            className="glass-frame"
          >
            <div className="glass-frame-content overflow-hidden rounded-[0.9rem]">
              <BrowserMockup
                imageUrl={weatherImg}
                alt="Website preview"
                url="arcadia.nuvia.store"
                aspectRatio="4/3"
                lazy={false}
                className="!shadow-none !ring-0 rounded-[0.9rem]"
              />
            </div>
          </motion.div>

          {/* Floating glass info chip — main preview */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-5 left-4 sm:-left-6 z-30 glass-chip rounded-2xl px-4 py-2.5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-nuvia-forest flex items-center justify-center">
                <Globe className="w-4 h-4 text-nuvia-champagne" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-nuvia-brown font-semibold">Featured Build</p>
                <p className="text-sm font-bold text-nuvia-ink leading-tight">Arcadia — Full Ownership</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Front layer — small floating photo card */}
      <motion.div
        style={parallax ? { x: frontX, y: frontY } : undefined}
        className="absolute bottom-0 left-0 sm:left-4 w-[120px] sm:w-[150px] z-30"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-2xl p-1.5 animate-float"
        >
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={travelCardImg}
              alt="Immersive website design"
              className="w-full h-auto object-cover rounded-xl"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-nuvia-ink/70 to-transparent p-2.5 pt-6">
              <p className="text-[10px] font-semibold text-white/95 leading-tight">Immersive &amp; interactive</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Front layer — rating chip */}
      <motion.div
        style={parallax ? { x: frontX, y: frontY } : undefined}
        className="absolute bottom-10 right-2 sm:right-8 z-30"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-chip rounded-2xl px-3.5 py-2.5 flex items-center gap-2 animate-float-soft"
        >
          <span className="w-7 h-7 rounded-full bg-nuvia-champagne/90 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-nuvia-ink fill-nuvia-ink" />
          </span>
          <div>
            <p className="text-xs font-bold text-nuvia-ink leading-none">4.8 Rating</p>
            <p className="text-[10px] text-nuvia-brown mt-0.5">Verified buyers</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Hint chip — explore CTA (desktop only) */}
      <motion.div
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.95 }}
        className="absolute top-1/2 -right-2 lg:-right-4 z-30 hidden xl:block"
      >
        <div className="glass-chip rounded-full pl-2 pr-3.5 py-1.5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-nuvia-forest flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 text-nuvia-ivory" />
          </span>
          <span className="text-xs font-semibold text-nuvia-ink">Explore the showroom</span>
        </div>
      </motion.div>
    </div>
  );
}
