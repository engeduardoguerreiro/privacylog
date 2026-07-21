import { Check, Crown } from "lucide-react";

export type LoungePlan = {
  name: string;
  price: string;
  featured?: boolean;
  features: string[];
};

export default function LoungePlanCard({ plan }: { plan: LoungePlan }) {
  return (
    <article className={`lounge-plan-card ${plan.featured ? "is-featured" : ""}`}>
      {plan.featured ? (
        <span className="privacy-badge badge-premium">
          <Crown size={13} />
          Recomendado
        </span>
      ) : null}
      <h2>{plan.name}</h2>
      <strong>{plan.price}</strong>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={16} />
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={`mailto:contato@privacylog.com.br?subject=Plano%20${encodeURIComponent(
          plan.name
        )}%20PrivacyLog%20Lounge`}
        className={plan.featured ? "primary-button" : "secondary-button"}
      >
        Quero este plano
      </a>
    </article>
  );
}
