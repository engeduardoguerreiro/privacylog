import type { StudioPlanSlug } from "@/lib/studio/types";

export type BillingPlan = {
  slug: StudioPlanSlug;
  name: string;
  /** Valor mensal em reais. null = nao vendido no autoatendimento. */
  amount: number | null;
};

/**
 * Precos de referencia da cobranca. O catalogo de marketing fica em
 * lib/studio/data.ts; aqui mora o valor que vai para o Mercado Pago.
 *
 * "premium" existe como valor legado no banco e no admin, mas nao tem preco
 * definido, entao fica fora do checkout ate ser decidido.
 */
export const billingPlans: Record<StudioPlanSlug, BillingPlan> = {
  essential: { slug: "essential", name: "Essencial", amount: 97 },
  premium: { slug: "premium", name: "Premium", amount: null },
  black: { slug: "black", name: "Black", amount: 397 },
};

export type PurchasablePlan = BillingPlan & { amount: number };

export function getBillingPlan(slug: string | null | undefined): BillingPlan | null {
  if (!slug) return null;
  return billingPlans[slug as StudioPlanSlug] ?? null;
}

export function isPurchasable(plan: BillingPlan | null): plan is PurchasablePlan {
  return Boolean(plan && plan.amount !== null);
}

/** Planos que a casa consegue assinar sozinha pelo painel. */
export function getPurchasablePlans(): PurchasablePlan[] {
  return Object.values(billingPlans).filter(isPurchasable);
}

export function formatBRL(amount: number) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
