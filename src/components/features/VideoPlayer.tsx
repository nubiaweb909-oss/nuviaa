import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { isValidUrl } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  title?: string;
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ url, thumbnail, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  if (!url || !isValidUrl(url)) return null;

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2">
        <ExternalLink className="w-4 h-4" /> Watch Demo
      </a>
    );
  }

  return (
    <div className="relative aspect-video bg-nuvia-forest rounded-2xl overflow-hidden">
      {!playing ? (
        <>
          {thumbnail && <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-70" />}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setPlaying(true)}
              className="w-16 h-16 rounded-full bg-nuvia-ivory/90 flex items-center justify-center shadow-nuvia-lg hover:bg-nuvia-ivory transition-all hover:scale-105"
              aria-label="Play video"
            >
              <Play className="w-7 h-7 text-nuvia-espresso fill-nuvia-forest ml-1" />
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-nuvia-espresso-deep/30 pointer-events-none" />
        </>
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || "Product Demo"}
        />
      )}
    </div>
  );
}
