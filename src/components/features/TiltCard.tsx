import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees */
  maxTilt?: number;
  /** Hover scale */
  scale?: number;
  /** Show a moving light glare that follows the cursor */
  glare?: boolean;
}

/**
 * TiltCard — lightweight 3D hover tilt wrapper (CSS transforms only).
 * Automatically disabled for touch devices and reduced-motion users.
 */
export default function TiltCard({
  children,
  className,
  maxTilt = 7,
  scale = 1.02,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [enabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 240, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), spring);

  const glareX = useTransform(px, [0, 1], ["22%", "78%"]);
  const glareY = useTransform(py, [0, 1], ["18%", "82%"]);
  const glareBg = useMotionTemplate`radial-gradient(460px circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 62%)`;

  const active = enabled && !reduceMotion;

  const handleMove = (e: React.MouseEvent) => {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className={cn("perspective-1200", className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={active ? { scale } : undefined}
        style={
          active
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : undefined
        }
        className="relative h-full w-full"
      >
        {children}
        {active && glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}
