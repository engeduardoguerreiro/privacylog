"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBillingPlan, isPurchasable } from "@/lib/billing/plans";
import {
  createPreapproval,
  isMercadoPagoConfigured,
} from "@/lib/billing/mercadopago";
import { recordCheckout } from "@/lib/billing/store";
import { getClinicForCurrentUser } from "@/lib/studio/owner";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMainSiteUrl } from "@/lib/subdomain";

/**
 * URL base real desta requisicao. O back_url e o notification_url do Mercado
 * Pago precisam apontar para onde o site esta de fato servindo — senao a
 * confirmacao do pagamento (webhook) nunca chega. Cai no NEXT_PUBLIC_SITE_URL
 * so se o host nao vier nos cabecalhos.
 */
async function resolveSiteUrl() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");

  if (host) {
    const proto = headerList.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  return getMainSiteUrl();
}

/**
 * Cria a assinatura no Mercado Pago e manda a casa para o checkout.
 * O pagamento so vira "ativo" quando o aviso do provedor chegar no webhook.
 */
export async function startSubscription(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/studio/login?next=/studio/painel/assinatura");
  }

  const clinic = await getClinicForCurrentUser();

  if (!clinic) {
    throw new Error("Nenhuma casa vinculada a esta conta.");
  }

  const planSlug = formData.get("plan");
  const plan = getBillingPlan(typeof planSlug === "string" ? planSlug : null);

  if (!isPurchasable(plan)) {
    throw new Error("Plano indisponivel para assinatura online.");
  }

  if (!isMercadoPagoConfigured()) {
    throw new Error(
      "Pagamento ainda nao configurado. Fale com o administrador do PrivacyLog."
    );
  }

  const site = await resolveSiteUrl();

  const preapproval = await createPreapproval({
    planName: plan.name,
    amount: plan.amount,
    payerEmail: user.email || "",
    externalReference: String(clinic.id),
    backUrl: `${site}/studio/painel/assinatura?retorno=1`,
    notificationUrl: `${site}/api/billing/mercadopago/webhook`,
  });

  await recordCheckout({
    clinicId: clinic.id,
    plan: plan.slug,
    amount: plan.amount,
    payerEmail: user.email || "",
    preapprovalId: preapproval.id,
  });

  if (!preapproval.init_point) {
    throw new Error("O Mercado Pago nao devolveu o link de pagamento.");
  }

  redirect(preapproval.init_point);
}
