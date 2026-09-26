import { cn } from "@/lib/utils";

interface BrowserMockupProps {
  imageUrl: string;
  alt?: string;
  url?: string;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "3/2";
  floating?: boolean;
  lazy?: boolean;
}

export default function BrowserMockup({
  imageUrl,
  alt = "Product preview",
  url = "nuvia.store/preview",
  className,
  aspectRatio = "16/9",
  floating = false,
  lazy = true,
}: BrowserMockupProps) {
  const ratioClass = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
  }[aspectRatio];

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden ring-1 ring-nuvia-ink/10 shadow-nuvia-mockup",
        floating && "animate-float",
        className
      )}
    >
      {/* Glass browser chrome */}
      <div className="browser-chrome px-3 py-2 flex items-center gap-2 border-b border-nuvia-ink/5">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8927C]/90 shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-nuvia-champagne/90 shadow-inner" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#AFC79B]/90 shadow-inner" />
        </div>
        {/* URL Bar */}
        <div className="flex-1 mx-3">
          <div className="bg-nuvia-ivory/70 rounded-md px-3 py-0.5 flex items-center gap-1.5 border border-nuvia-ink/5">
            <svg className="w-2.5 h-2.5 text-nuvia-moss flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] text-nuvia-brown/80 font-mono truncate">{url}</span>
          </div>
        </div>
        {/* Nav buttons */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-nuvia-ivory/70 border border-nuvia-ink/5 flex items-center justify-center">
            <div className="w-1.5 h-1 border-l border-t border-nuvia-brown/50" style={{ transform: "rotate(-45deg)" }} />
          </div>
          <div className="w-3.5 h-3.5 rounded bg-nuvia-ivory/70 border border-nuvia-ink/5 flex items-center justify-center">
            <div className="w-1.5 h-1 border-r border-t border-nuvia-brown/50" style={{ transform: "rotate(45deg)" }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={cn(ratioClass, "relative overflow-hidden bg-nuvia-beige")}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover object-top"
          loading={lazy ? "lazy" : "eager"}
        />
        {/* Subtle glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-nuvia-ink/10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/40 pointer-events-none" />
      </div>
    </div>
  );
}
