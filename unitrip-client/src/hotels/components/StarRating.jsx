import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} star hotel`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < value ? "fill-accent text-accent-foreground" : "text-border"
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}
