import { Star } from "lucide-react";

export default function StarRating({ value = 0, count, onChange, size = 16 }) {
  const interactive = typeof onChange === "function";
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `Dar nota ${star}` : undefined}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        </button>
      ))}
      {typeof count === "number" && (
        <span className="ml-1 text-sm text-slate-400">
          {value > 0 ? value.toFixed(1) : "—"} ({count})
        </span>
      )}
    </div>
  );
}
