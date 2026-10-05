import { createAdminClient } from "@/lib/supabase/admin";
import type { Preapproval } from "./mercadopago";
import {
  isEntitled,
  mapPreapprovalStatus,
  type SubscriptionStatus,
} from "./subscription";

function admin() {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada.");
  }

  return supabase;
}

export type StudioSubscription = {
  id: number;
  clinic_id: number;
  plan: string;
  status: SubscriptionStatus;
  preapproval_id: string | null;
  payer_email: string | null;
  amount: number | null;
  current_period_end: string | null;
  canceled_at: string | null;
};

export async function getClinicSubscription(
  clinicId: number
): Promise<StudioSubscription | null> {
  const { data, error } = await admin()
    .from("studio_subscriptions")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Assinatura: falha ao carregar", error);
    return null;
  }

  return (data as StudioSubscription | null) ?? null;
}

/**
 * preapproval mais recente de uma casa. Serve para ligar um aviso de
 * pagamento (que nem sempre traz o preapproval_id) de volta a assinatura,
 * via external_reference = id da casa.
 */
export async function getLatestPreapprovalIdForClinic(
  clinicId: number
): Promise<string | null> {
  const { data } = await admin()
    .from("studio_subscriptions")
    .select("preapproval_id")
    .eq("clinic_id", clinicId)
    .not("preapproval_id", "is", null)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as { preapproval_id?: string } | null)?.preapproval_id || null;
}

/**
 * Espelha a assinatura na clinica e decide se ela fica publicada.
 *
 * So mexe em clinicas que tem assinatura. Casas sem cobranca (cortesia,
 * legado, cadastro manual) seguem sob controle do administrador.
 *
 * A moderacao do admin vem primeiro: a cobranca nunca publica uma casa que
 * ainda esta em revisao (pending) nem reativa uma que o admin suspendeu. Ela
 * so derruba casas aprovadas e so religa as que ela mesma derrubou
 * (suspended_for_billing).
 */
export async function syncClinicEntitlement({
  clinicId,
  status,
  until,
  plan,
}: {
  clinicId: number;
  status: SubscriptionStatus;
  until: string | null;
  /** Plano contratado; so aplicado quando a assinatura esta ativa. */
  plan?: string | null;
}) {
  const { data: clinic, error } = await admin()
    .from("studio_clinics")
    .select("status, suspended_for_billing")
    .eq("id", clinicId)
    .maybeSingle();

  if (error || !clinic) {
    throw new Error(
      `Nao foi possivel carregar a clinica ${clinicId}: ${error?.message || "nao encontrada"}`
    );
  }

  const current = clinic as { status: string; suspended_for_billing: boolean | null };
  const entitled = isEntitled(status);
  const changes: Record<string, unknown> = {
    subscription_status: status,
    subscription_until: until,
    updated_at: new Date().toISOString(),
  };

  if (entitled) {
    // O plano define destaque na home e presenca no mapa, entao so vale
    // depois que o pagamento e confirmado.
    if (plan) {
      changes.plan = plan;
    }

    if (current.status === "suspended" && current.suspended_for_billing) {
      changes.status = "approved";
      changes.suspended_for_billing = false;
    }
  } else if (shouldSuspendForBilling(status, until) && current.status === "approved") {
    changes.status = "suspended";
    changes.suspended_for_billing = true;
  }

  const { error: updateError } = await admin()
    .from("studio_clinics")
    .update(changes)
    .eq("id", clinicId);

  if (updateError) {
    throw new Error(
      `Nao foi possivel atualizar a clinica ${clinicId}: ${updateError.message}`
    );
  }
}

/**
 * pending = um novo checkout ainda nao pago (troca de plano, por exemplo): nao
 * derruba quem ja esta no ar. canceled respeita o periodo ja pago; o cron
 * derruba quando ele acabar.
 */
function shouldSuspendForBilling(status: SubscriptionStatus, until: string | null) {
  if (status === "past_due") {
    return true;
  }

  if (status === "canceled") {
    return !until || new Date(until).getTime() <= Date.now();
  }

  return false;
}

/** Guarda a assinatura recem-criada, antes de a casa pagar. */
export async function recordCheckout({
  clinicId,
  plan,
  amount,
  payerEmail,
  preapprovalId,
}: {
  clinicId: number;
  plan: string;
  amount: number;
  payerEmail: string;
  preapprovalId: string;
}) {
  const { error } = await admin()
    .from("studio_subscriptions")
    .upsert(
      {
        clinic_id: clinicId,
        plan,
        amount,
        payer_email: payerEmail,
        preapproval_id: preapprovalId,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "preapproval_id" }
    );

  if (error) {
    throw new Error(`Nao foi possivel registrar a assinatura: ${error.message}`);
  }

  // Casa ja ativa trocando de plano continua "active" ate o novo pagamento.
  await admin()
    .from("studio_clinics")
    .update({ subscription_status: "pending", updated_at: new Date().toISOString() })
    .eq("id", clinicId)
    .neq("subscription_status", "active");
}

/** Aplica o estado vindo do Mercado Pago na assinatura e na clinica. */
export async function applyPreapproval(preapproval: Preapproval) {
  const status = mapPreapprovalStatus(preapproval.status);
  const clinicId = Number(preapproval.external_reference);

  if (!Number.isFinite(clinicId) || clinicId <= 0) {
    console.error("Assinatura: external_reference invalido", preapproval.id);
    return null;
  }

  const periodEnd = preapproval.next_payment_date || null;

  // Atualiza sem tocar em "plan": ele foi gravado no checkout e o
  // Mercado Pago nao devolve o slug do nosso catalogo.
  const changes = {
    status,
    payer_email: preapproval.payer_email || null,
    amount: preapproval.auto_recurring?.transaction_amount ?? null,
    current_period_end: periodEnd,
    canceled_at: status === "canceled" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await admin()
    .from("studio_subscriptions")
    .update(changes)
    .eq("preapproval_id", preapproval.id)
    .select("id, plan");

  if (error) {
    throw new Error(`Nao foi possivel atualizar a assinatura: ${error.message}`);
  }

  // Assinatura criada fora do site (ou checkout perdido): registra agora.
  if (!updated?.length) {
    const { error: insertError } = await admin()
      .from("studio_subscriptions")
      .insert({
        clinic_id: clinicId,
        plan: "",
        preapproval_id: preapproval.id,
        ...changes,
      });

    if (insertError) {
      throw new Error(
        `Nao foi possivel registrar a assinatura: ${insertError.message}`
      );
    }
  }

  const plan = (updated?.[0] as { plan?: string } | undefined)?.plan || null;

  await syncClinicEntitlement({ clinicId, status, until: periodEnd, plan });

  return { clinicId, status };
}

/** O Mercado Pago reenvia a mesma notificacao ate receber 200. */
export async function wasBillingEventProcessed(eventId: string) {
  const { data, error } = await admin()
    .from("studio_billing_events")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    console.error("Assinatura: falha ao checar aviso repetido", error);
    return false;
  }

  return Boolean(data);
}

/**
 * Registra o aviso como tratado. Chamado depois do processamento: se algo
 * falhar no meio, o aviso nao fica marcado e o reenvio consegue reprocessar.
 */
export async function registerBillingEvent({
  eventId,
  eventType,
  payload,
}: {
  eventId: string;
  eventType: string | null;
  payload: unknown;
}) {
  const { error } = await admin()
    .from("studio_billing_events")
    .insert({ event_id: eventId, event_type: eventType, payload });

  // 23505 = unique_violation: dois avisos iguais chegaram juntos.
  if (error && (error as { code?: string }).code !== "23505") {
    console.error("Assinatura: falha ao registrar o aviso", error);
  }
}

/**
 * Rede de seguranca do cron: derruba quem venceu e cujo aviso de renovacao
 * nunca chegou.
 */
export async function expireOverdueSubscriptions() {
  const now = new Date().toISOString();

  const { data, error } = await admin()
    .from("studio_clinics")
    .select("id, subscription_status")
    .in("subscription_status", ["active", "canceled"])
    .lt("subscription_until", now);

  if (error) {
    throw new Error(`Nao foi possivel checar vencimentos: ${error.message}`);
  }

  const rows = (data || []) as { id: number; subscription_status: SubscriptionStatus }[];
  const ids = rows.map((row) => row.id);

  for (const row of rows) {
    // Cancelada com periodo pago encerrado continua "canceled"; ativa sem
    // aviso de renovacao vira "past_due".
    const status: SubscriptionStatus =
      row.subscription_status === "canceled" ? "canceled" : "past_due";

    await syncClinicEntitlement({ clinicId: row.id, status, until: null });

    if (status === "past_due") {
      await admin()
        .from("studio_subscriptions")
        .update({ status: "past_due", updated_at: now })
        .eq("clinic_id", row.id)
        .eq("status", "active");
    }
  }

  return ids;
}
