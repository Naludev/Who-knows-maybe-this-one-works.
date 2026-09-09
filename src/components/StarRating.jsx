import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({ value = 0, onChange, size = 18, className }) {
  const [hover, setHover] = React.useState(0);
  const display = hover || value;
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(n)}
          className={cn("transition-transform", onChange && "hover:scale-110 cursor-pointer", !onChange && "cursor-default")}
        >
          <Star
            size={size}
            className={cn(
              n <= display ? "fill-warning text-warning" : "fill-none text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}