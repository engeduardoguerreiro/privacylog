/** Situacao da assinatura de uma casa, do ponto de vista do site. */
export type SubscriptionStatus =
  | "none"
  | "pending"
  | "active"
  | "past_due"
  | "canceled";

/**
 * Estados do preapproval no Mercado Pago:
 *   pending    - criado, o pagador ainda nao autorizou
 *   authorized - assinatura ativa e cobrando
 *   paused     - cobranca falhou e a recorrencia parou
 *   cancelled  - encerrada
 */
export function mapPreapprovalStatus(status: string | null | undefined): SubscriptionStatus {
  switch (status) {
    case "authorized":
      return "active";
    case "pending":
      return "pending";
    case "paused":
      return "past_due";
    case "cancelled":
      return "canceled";
    default:
      return "pending";
  }
}

/** Somente assinatura ativa mantem a casa publicada. */
export function isEntitled(status: SubscriptionStatus) {
  return status === "active";
}

export function getSubscriptionLabel(status: SubscriptionStatus) {
  const labels: Record<SubscriptionStatus, string> = {
    none: "Sem assinatura",
    pending: "Aguardando pagamento",
    active: "Ativa",
    past_due: "Pagamento em atraso",
    canceled: "Cancelada",
  };

  return labels[status] ?? "Sem assinatura";
}
