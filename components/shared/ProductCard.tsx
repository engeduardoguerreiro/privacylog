import { ArrowRight, Clock } from "lucide-react";
import PremiumButton from "./PremiumButton";

type ProductCardProps = {
  title: string;
  description: string;
  href?: string;
  status?: string;
  accent: "gold" | "wine" | "blue" | "pink";
};

export default function ProductCard({
  title,
  description,
  href,
  status,
  accent = "gold",
}: ProductCardProps) {
  const comingSoon = status === "Em breve";

  return (
    <article className={`ecosystem-card ecosystem-card-${accent}`}>
      <div>
        {status ? (
          <span className="privacy-badge badge-premium">
            {comingSoon ? <Clock size={13} /> : null}
            {status}
          </span>
        ) : null}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <PremiumButton href={href} disabled={comingSoon}>
        {comingSoon ? "Em breve" : "Acessar"}
        {!comingSoon ? <ArrowRight size={16} /> : null}
      </PremiumButton>
    </article>
  );
}
