import { headers } from "next/headers";
import { getMainSiteUrl, isLocalHost, normalizeHost } from "@/lib/subdomain";

/** Hosts em que o proprio site roda: producao, previews da Vercel e dev. */
function isTrustedHost(host: string) {
  const normalized = normalizeHost(host);

  return (
    normalized === "privacylog.com.br" ||
    normalized === "www.privacylog.com.br" ||
    normalized.endsWith(".vercel.app") ||
    isLocalHost(normalized)
  );
}

/**
 * Origem desta requisicao para montar links de retorno (confirmacao de
 * e-mail, back_url e webhook do Mercado Pago). Usa o host da requisicao para
 * que previews recebam o proprio webhook, mas so se ele for um host nosso:
 * cabecalho forjado cai no NEXT_PUBLIC_SITE_URL.
 */
export async function getTrustedRequestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";

  if (host && isTrustedHost(host)) {
    const local = isLocalHost(host);
    const proto = headerList.get("x-forwarded-proto") || (local ? "http" : "https");
    return `${proto === "http" && !local ? "https" : proto}://${host}`;
  }

  return getMainSiteUrl();
}
