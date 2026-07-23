import { Check } from "lucide-react";
import { studioPlans } from "@/lib/studio/data";
import styles from "../../admin.module.css";

export default function AdminPlansPage() {
  return (
    <div>
      <p className={styles.kicker}>Clínicas assinantes</p>
      <h1 className={styles.pageTitle}>Planos</h1>
      <p className={styles.lead}>
        Planos oferecidos às casas. Estes valores aparecem na página &ldquo;Quero
        anunciar&rdquo;.
      </p>

      <div className={styles.cards}>
        {studioPlans.map((plan) => (
          <article key={plan.slug} className={styles.planCard}>
            <div className={styles.planTop}>
              <div>
                <h2 className={styles.planTitle}>{plan.name}</h2>
                {plan.highlight ? (
                  <span className={`${styles.badge} ${styles.badgeWarn}`}>
                    {plan.highlight}
                  </span>
                ) : null}
              </div>
              <strong className={styles.planValue}>{plan.price}</strong>
            </div>

            <p className={styles.planAudience}>{plan.audience}</p>

            {plan.digitalAddress ? (
              <div className={styles.planAddress}>
                <span>{plan.digitalAddress.title}</span>
                <strong>{plan.digitalAddress.value}</strong>
                <small>{plan.digitalAddress.note}</small>
              </div>
            ) : null}

            <ul className={styles.planList}>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className={styles.notice} style={{ marginTop: 24 }}>
        Para alterar nome, preço ou itens de um plano, edite{" "}
        <code>lib/studio/data.ts</code>. Quando a cobrança automática entrar no
        ar, esta tela passa a editar direto no banco.
      </div>
    </div>
  );
}
