import { Star } from "lucide-react";

export default function RatingBadge({ nota }: { nota?: number | null }) {
  if (!nota) {
    return null;
  }

  return (
    <span className="privacy-badge badge-premium">
      <Star size={13} fill="currentColor" />
      {Number(nota).toFixed(1)}
    </span>
  );
}
