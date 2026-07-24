import { createHmac, timingSafeEqual } from "node:crypto";

const apiBase = "https://api.mercadopago.com";

function accessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return token || null;
}

function webhookSecret() {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  return secret || null;
}

/** Permite o site rodar sem cobranca configurada (dev, preview). */
export function isMercadoPagoConfigured() {
  return accessToken() !== null;
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = accessToken();

  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN nao configurado.");
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      `Mercado Pago respondeu ${response.status}: ${body?.message || "falha na requisicao"}`
    );
  }

  return body as T;
}

export type Preapproval = {
  id: string;
  status: string;
  init_point?: string;
  payer_email?: string;
  external_reference?: string;
  next_payment_date?: string;
  auto_recurring?: {
    transaction_amount?: number;
    frequency?: number;
    frequency_type?: string;
  };
};

/** Cria a assinatura mensal e devolve o link de checkout (init_point). */
export async function createPreapproval({
  planName,
  amount,
  payerEmail,
  externalReference,
  backUrl,
  notificationUrl,
}: {
  planName: string;
  amount: number;
  payerEmail: string;
  externalReference: string;
  backUrl: string;
  notificationUrl?: string;
}) {
  return mpFetch<Preapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: `PrivacyLog ${planName}`,
      external_reference: externalReference,
      payer_email: payerEmail,
      back_url: backUrl,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: "BRL",
      },
      status: "pending",
    }),
  });
}

export async function getPreapproval(id: string) {
  return mpFetch<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);
}

export type MercadoPagoPayment = {
  id: number;
  status: string;
  metadata?: Record<string, unknown>;
  external_reference?: string;
  preapproval_id?: string;
};

export async function getPayment(id: string) {
  return mpFetch<MercadoPagoPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

export async function cancelPreapproval(id: string) {
  return mpFetch<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });
}

/**
 * Confere a assinatura do aviso (header x-signature), no formato
 * "ts=<timestamp>,v1=<hmac>". O manifesto assinado pelo Mercado Pago e
 * "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 *
 * Sem segredo configurado devolve false: preferimos recusar o aviso a
 * aceitar qualquer requisicao que chegue no endpoint.
 */
export function verifyWebhookSignature({
  signature,
  requestId,
  dataId,
}: {
  signature: string | null;
  requestId: string | null;
  dataId: string | null;
}) {
  const secret = webhookSecret();

  if (!secret || !signature || !dataId) {
    return false;
  }

  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const ts = parts.ts;
  const hash = parts.v1;

  if (!ts || !hash) {
    return false;
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId || ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(hash, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
