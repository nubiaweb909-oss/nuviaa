import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  const sizeClass = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" }[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            "transition-colors",
            i < Math.round(rating) ? "fill-nuvia-champagne text-nuvia-champagne" : "text-nuvia-surface-2 fill-nuvia-surface-2",
            interactive && "cursor-pointer hover:text-nuvia-champagne hover:fill-nuvia-champagne"
          )}
          onClick={() => interactive && onRate?.(i + 1)}
        />
      ))}
    </div>
  );
}
