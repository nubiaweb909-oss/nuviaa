import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

function getEmbedUrl(url: string): { embed: string; isEmbed: boolean } {
  if (!url) return { embed: "", isEmbed: false };

  // YouTube
  const ytMatch =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/) ||
    url.match(/youtube\.com\/shorts\/([^?/\s]+)/);
  if (ytMatch) {
    return {
      embed: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      isEmbed: true,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      embed: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&color=3B2A20`,
      isEmbed: true,
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) {
    return {
      embed: `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`,
      isEmbed: true,
    };
  }

  // Cloudinary (video)
  if (url.includes("cloudinary.com") && url.match(/\.(mp4|webm|mov|avi)/i)) {
    return { embed: url, isEmbed: false };
  }

  // Direct video file
  if (url.match(/\.(mp4|webm|mov|avi|ogv)(\?.*)?$/i)) {
    return { embed: url, isEmbed: false };
  }

  // Fallback: treat as iframe embed
  return { embed: url, isEmbed: true };
}

export default function VideoModal({ open, onClose, url, title }: VideoModalProps) {
  const { embed, isEmbed } = getEmbedUrl(url);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Video Demo"}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-nuvia-ink/90 backdrop-blur-md" onClick={onClose} />

          {/* Modal */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-4xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                {title && (
                  <span className="text-nuvia-surface-2 text-sm font-medium truncate max-w-[200px] sm:max-w-sm">
                    {title} — Live Demo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-nuvia-surface-2/70 hover:text-nuvia-ivory hover:bg-white/10 transition-all"
                  aria-label="Open in new tab"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-nuvia-surface-2/70 hover:text-nuvia-ivory hover:bg-white/10 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-nuvia-xl"
              style={{ aspectRatio: "16/9" }}
            >
              {isEmbed ? (
                <iframe
                  src={embed}
                  title={title || "Video Demo"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={embed}
                  controls
                  autoPlay
                  className="w-full h-full"
                  playsInline
                >
                  <source src={embed} />
                  Your browser does not support HTML5 video.
                </video>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
