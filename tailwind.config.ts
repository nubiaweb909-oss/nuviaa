import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        nuvia: {
          // ── Nuvia botanical brand palette ────────────────────────────
          ivory: "#FAF8F2",
          cream: "#F3E8D4",
          warm: "#F7F1E3",
          "beige-light": "#F4EDDC",
          beige: "#EDE2CB",
          surface: "#E3D8C2",
          "surface-2": "#D1C4A7",
          "surface-3": "#BAA987",
          forest: "#174C42",
          "forest-dark": "#0F3A32",
          "forest-light": "#1E5F53",
          moss: "#236B5B",
          sage: "#789B7C",
          "sage-light": "#AFC79B",
          earth: "#6B3F2D",
          terra: "#9A6045",
          champagne: "#D7B98E",
          "champagne-light": "#EBDCC0",
          ink: "#17231F",
          // ── Legacy tokens (remapped onto the new palette so existing
          //    class names across the app inherit the redesign) ─────────
          espresso: "#17231F",
          "espresso-dark": "#0E1A16",
          "espresso-deep": "#0B1310",
          black: "#0B1310",
          brown: "#52645B",
          "brown-light": "#71836F",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ["Sora", "Manrope", "system-ui", "sans-serif"],
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-7px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 5s ease-in-out infinite",
        "float-soft": "float-soft 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      backgroundImage: {
        "nuvia-gradient": "linear-gradient(135deg, #FAF8F2 0%, #F3E8D4 100%)",
        "nuvia-hero": [
          "radial-gradient(1100px 520px at 88% -8%, rgba(175,199,155,0.38), transparent 60%)",
          "radial-gradient(900px 480px at -8% 24%, rgba(215,185,142,0.30), transparent 55%)",
          "radial-gradient(800px 560px at 55% 112%, rgba(120,155,124,0.20), transparent 60%)",
          "linear-gradient(180deg, #FAF8F2 0%, #F5EFDF 100%)",
        ].join(", "),
        "nuvia-dark": "linear-gradient(150deg, #143630 0%, #17231F 55%, #0B1310 100%)",
        "nuvia-card": "linear-gradient(145deg, #FFFDF8 0%, #F7F1E3 100%)",
      },
      boxShadow: {
        "nuvia-sm": "0 2px 10px rgba(23, 35, 31, 0.05)",
        "nuvia-md": "0 6px 24px rgba(23, 35, 31, 0.08)",
        "nuvia-lg": "0 12px 48px rgba(23, 35, 31, 0.12)",
        "nuvia-xl": "0 24px 72px rgba(23, 35, 31, 0.18)",
        "nuvia-mockup":
          "0 40px 90px rgba(11, 19, 16, 0.30), 0 12px 28px rgba(11, 19, 16, 0.16)",
        glass: "inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 8px 32px rgba(23, 35, 31, 0.08)",
        "glass-lg":
          "inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 16px 56px rgba(23, 35, 31, 0.14)",
        "glow-champagne":
          "0 0 0 1px rgba(215, 185, 142, 0.4), 0 8px 28px rgba(215, 185, 142, 0.28)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
