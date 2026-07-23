export type Product = "main" | "lounge" | "studio";

const mainDomain = "privacylog.com.br";

export function normalizeHost(host: string) {
  return host.split(":")[0]?.toLowerCase().trim() || "";
}

/** Detecta os subdominios legados, ainda usados para redirecionar para a raiz. */
export function getProductFromHost(host: string): Product {
  const normalizedHost = normalizeHost(host);

  if (normalizedHost === `lounge.${mainDomain}`) {
    return "lounge";
  }

  if (normalizedHost === `studio.${mainDomain}`) {
    return "studio";
  }

  return "main";
}

export function getMainSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || `https://${mainDomain}`;
}

/**
 * Todo o site vive em privacylog.com.br; o antigo produto virou apenas
 * um prefixo de caminho (/lounge, /studio). Os subdominios foram aposentados.
 */
export function getProductBaseUrl(product: Product) {
  const base = getMainSiteUrl();
  return product === "main" ? base : `${base}/${product}`;
}

export function isLocalHost(host: string) {
  const normalizedHost = normalizeHost(host);

  return (
    normalizedHost === "localhost" ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost === "0.0.0.0" ||
    normalizedHost.endsWith(".local")
  );
}
