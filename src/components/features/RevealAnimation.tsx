import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface RevealAnimationProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

export default function RevealAnimation({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: RevealAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 24 : direction === "down" ? -24 : 0,
      x: direction === "left" ? 24 : direction === "right" ? -24 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };

  return (
    <div ref={ref} className={className}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
