import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export default function ImageGallery({ images, alt = "Product image" }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const total = images.length;

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [total]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [total]);

  const openLightbox = (index: number) => {
    setCurrent(index);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setLightbox(true);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.5, 4));
      else if (e.key === "-") setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  // Pan handlers (when zoomed in)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  // Touch pan / pinch-zoom is handled via CSS touch-action and native browser pinch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning && zoom > 1) {
      setPanOffset({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
    }
  };
  const handleTouchEnd = () => setIsPanning(false);

  if (!images.length) return null;

  return (
    <>
      {/* ─── Gallery Preview ──────────────────────────── */}
      <div className="space-y-3">
        {/* Main 1:1 preview tile */}
        <div
          className="relative aspect-square bg-nuvia-beige-light rounded-2xl overflow-hidden group cursor-zoom-in"
          onClick={() => openLightbox(current)}
          role="button"
          tabIndex={0}
          aria-label="Open full-screen viewer"
          onKeyDown={(e) => e.key === "Enter" && openLightbox(current)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              alt={`${alt} ${current + 1}`}
              className="w-full h-full object-cover object-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              loading="lazy"
              decoding="async"
            />
          </AnimatePresence>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-nuvia-ink/0 group-hover:bg-nuvia-ink/20 transition-all flex items-center justify-center pointer-events-none">
            <div className="bg-nuvia-ivory/90 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-nuvia-md">
              <Maximize2 className="w-5 h-5 text-nuvia-espresso" />
            </div>
          </div>

          {/* Arrow controls (don't open lightbox) */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-nuvia-ivory/90 flex items-center justify-center shadow-nuvia-sm hover:bg-nuvia-ivory transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-nuvia-espresso" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-nuvia-ivory/90 flex items-center justify-center shadow-nuvia-sm hover:bg-nuvia-ivory transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-nuvia-espresso" />
              </button>
            </>
          )}

          {/* Image counter */}
          {total > 1 && (
            <div className="absolute bottom-3 right-3 bg-nuvia-forest/70 text-nuvia-ivory text-xs px-2 py-1 rounded-full font-mono">
              {current + 1}/{total}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-nuvia-espresso ${
                  i === current
                    ? "border-nuvia-forest shadow-nuvia-sm"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-nuvia-surface-2"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img}
                  alt={`${alt} thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Full-Screen Lightbox ─────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black/95"
            style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm font-mono">{current + 1} / {total}</span>
                <span className="text-white/40 text-xs truncate max-w-[200px]">{alt}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <button
                  onClick={() => { setZoom((z) => Math.max(z - 0.5, 1)); if (zoom <= 1.5) setPanOffset({ x: 0, y: 0 }); }}
                  disabled={zoom <= 1}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white/60 text-xs font-mono w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
                  disabled={zoom >= 4}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {/* Close */}
                <button
                  onClick={closeLightbox}
                  className="p-2 ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image viewport */}
            <div
              className="flex-1 relative overflow-hidden flex items-center justify-center"
              onClick={(e) => {
                // Close if clicking background (not image), only when not zoomed
                if (e.target === e.currentTarget && zoom <= 1) closeLightbox();
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="relative flex items-center justify-center w-full h-full"
                  style={{
                    cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/*
                    The image is displayed with:
                    - max-width: 100% of viewport
                    - max-height: available area
                    - object-fit: contain  → preserves full aspect ratio, no cropping
                    - transform: scale(zoom)  → zoom in/out
                    - The container has overflow:hidden so the enlarged image clips to the viewport
                  */}
                  <img
                    src={images[current]}
                    alt={`${alt} ${current + 1} — full size`}
                    className="block select-none"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "calc(100vh - 120px)",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                      transformOrigin: "center center",
                      transition: isPanning ? "none" : "transform 0.2s ease",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      // Ensure crisp rendering at any zoom
                      imageRendering: zoom > 2 ? "pixelated" : "auto",
                    }}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Side nav arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/10 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/10 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail strip */}
            {total > 1 && (
              <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm py-3 px-4">
                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrent(i); setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === current
                          ? "border-white opacity-100"
                          : "border-transparent opacity-40 hover:opacity-80"
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      {/*
                        Thumbnails in the strip are intentionally 1:1 cropped for consistency.
                        The full image is shown in the main viewport above.
                      */}
                      <img
                        src={img}
                        alt={`${alt} ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-white/30 text-xs mt-2 hidden sm:block">
                  ← → to navigate · scroll or pinch to zoom · Esc to close
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
