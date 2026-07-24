import { getPurchasablePlans, formatBRL, getBillingPlan } from "@/lib/billing/plans";
import { isMercadoPagoConfigured } from "@/lib/billing/mercadopago";
import { getClinicSubscription } from "@/lib/billing/store";
import {
  getSubscriptionLabel,
  type SubscriptionStatus,
} from "@/lib/billing/subscription";
import { getClinicForCurrentUser } from "@/lib/studio/owner";
import { startSubscription } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function StudioPanelSubscriptionPage() {
  const clinic = await getClinicForCurrentUser();

  if (!clinic) {
    return (
      <>
        <p className="studio-kicker">Assinatura</p>
        <h1>Assinatura da casa</h1>
        <section className="studio-panel-card">
          <p>
            Esta conta ainda nao esta vinculada a nenhuma casa. Fale com o
            PrivacyLog para concluir o cadastro.
          </p>
        </section>
      </>
    );
  }

  const subscription = await getClinicSubscription(clinic.id);
  const status = (clinic.subscription_status || "none") as SubscriptionStatus;
  const currentPlan = getBillingPlan(subscription?.plan || clinic.plan);
  const renewsAt = formatDate(subscription?.current_period_end || null);
  const configured = isMercadoPagoConfigured();

  return (
    <>
      <p className="studio-kicker">Assinatura</p>
      <h1>Assinatura da casa</h1>

      <section className="studio-panel-card">
        <h2>Situacao atual</h2>
        <p>
          <strong>{getSubscriptionLabel(status)}</strong>
          {currentPlan ? ` — plano ${currentPlan.name}` : ""}
        </p>

        {renewsAt && status === "active" ? (
          <p>Proxima cobranca em {renewsAt}.</p>
        ) : null}

        {status === "past_due" ? (
          <p>
            O pagamento nao foi confirmado e a pagina da casa saiu do ar.
            Assine novamente para voltar a aparecer no site.
          </p>
        ) : null}

        {status === "pending" ? (
          <p>
            Estamos aguardando a confirmacao do pagamento. Assim que o Mercado
            Pago confirmar, a pagina entra no ar automaticamente.
          </p>
        ) : null}
      </section>

      <section className="studio-panel-card">
        <h2>Planos</h2>

        {!configured ? (
          <p>
            O pagamento online ainda nao esta configurado. Fale com o
            administrador do PrivacyLog para assinar.
          </p>
        ) : null}

        <div className="studio-plan-grid">
          {getPurchasablePlans().map((plan) => (
            <form key={plan.slug} action={startSubscription}>
              <input type="hidden" name="plan" value={plan.slug} />
              <article className="studio-panel-card">
                <h3>{plan.name}</h3>
                <p>
                  <strong>{formatBRL(plan.amount)}</strong> por mes
                </p>
                <button
                  type="submit"
                  className="studio-button primary"
                  disabled={!configured}
                >
                  {status === "active" && currentPlan?.slug === plan.slug
                    ? "Plano atual"
                    : "Assinar"}
                </button>
              </article>
            </form>
          ))}
        </div>

        <p className="studio-hint">
          A cobranca e mensal e recorrente, feita pelo Mercado Pago. Se o
          pagamento falhar, a pagina da casa sai do ar ate a regularizacao.
        </p>
      </section>
    </>
  );
}
