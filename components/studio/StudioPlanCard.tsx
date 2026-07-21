import Link from "next/link";
import { Crown } from "lucide-react";
import type { StudioPlan } from "@/lib/studio/types";

export default function StudioPlanCard({ plan }: { plan: StudioPlan }) {
  const isBlack = plan.slug === "black";

  return (
    <article className={`studio-plan-card ${isBlack ? "is-black" : ""}`}>
      {plan.highlight ? (
        <span className="studio-plan-badge">
          <Crown size={14} />
          {plan.highlight}
        </span>
      ) : null}
      <h3>{plan.name}</h3>
      <strong>{plan.price}</strong>
      <p>{plan.audience}</p>
      <div className="studio-address-box">
        <span>{plan.digitalAddress.title}</span>
        <code>{plan.digitalAddress.value}</code>
        <small>{plan.digitalAddress.note}</small>
      </div>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Link href={`/studio/solicitar-site?plano=${plan.slug}`} className="studio-button primary">
        Quero o {plan.name}
      </Link>
    </article>
  );
}
