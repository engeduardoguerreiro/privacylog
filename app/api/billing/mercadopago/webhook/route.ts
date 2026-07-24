import { NextResponse } from "next/server";
import {
  getPayment,
  getPreapproval,
  verifyWebhookSignature,
} from "@/lib/billing/mercadopago";
import {
  applyPreapproval,
  registerBillingEvent,
  wasBillingEventProcessed,
} from "@/lib/billing/store";

// Precisa do node:crypto para conferir a assinatura do aviso.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Notification = {
  id?: number | string;
  type?: string;
  action?: string;
  data?: { id?: string };
};

/**
 * Avisos de assinatura do Mercado Pago.
 *
 * Sempre respondemos 200 quando o aviso e legitimo, mesmo se ja tratado:
 * o provedor reenvia ate receber 200. Falha de assinatura devolve 401.
 */
export async function POST(request: Request) {
  const raw = await request.text();

  let notification: Notification;

  try {
    notification = JSON.parse(raw) as Notification;
  } catch {
    return NextResponse.json({ error: "corpo invalido" }, { status: 400 });
  }

  const dataId = notification.data?.id ? String(notification.data.id) : null;

  const authentic = verifyWebhookSignature({
    signature: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
  });

  if (!authentic) {
    console.warn("Webhook Mercado Pago: assinatura invalida");
    return NextResponse.json({ error: "assinatura invalida" }, { status: 401 });
  }

  if (!dataId) {
    return NextResponse.json({ error: "sem data.id" }, { status: 400 });
  }

  const type = notification.type || notification.action || null;
  const eventId = `${type || "evento"}:${dataId}`;

  try {
    // Ja tratado antes: confirma para o provedor parar de reenviar.
    if (await wasBillingEventProcessed(eventId)) {
      return NextResponse.json({ ok: true, repetido: true });
    }

    // Assinatura: o proprio data.id e o preapproval.
    if (type?.includes("preapproval")) {
      const preapproval = await getPreapproval(dataId);
      await applyPreapproval(preapproval);
    } else if (type?.includes("payment")) {
      // Cobranca da recorrencia: do pagamento subimos ate a assinatura.
      const payment = await getPayment(dataId);

      if (payment.preapproval_id) {
        const preapproval = await getPreapproval(payment.preapproval_id);
        await applyPreapproval(preapproval);
      }
    } else {
      return NextResponse.json({ ok: true, ignorado: type });
    }

    await registerBillingEvent({
      eventId,
      eventType: type,
      payload: notification,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Mercado Pago: falha ao processar", error);

    // 500 faz o Mercado Pago reenviar depois.
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }
}
