export type Product = "main" | "lounge" | "studio";

const mainDomain = "privacylog.com.br";

export function normalizeHost(host: string) {
  return host.split(":")[0]?.toLowerCase().trim() || "";
}

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

export function getProductBaseUrl(product: Product) {
  const urls: Record<Product, string> = {
    main: process.env.NEXT_PUBLIC_SITE_URL || `https://${mainDomain}`,
    lounge:
      process.env.NEXT_PUBLIC_LOUNGE_URL || `https://lounge.${mainDomain}`,
    studio:
      process.env.NEXT_PUBLIC_STUDIO_URL || `https://studio.${mainDomain}`,
  };

  return urls[product];
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

export function isMainDomain(host: string) {
  return getProductFromHost(host) === "main";
}

export function isLoungeDomain(host: string) {
  return getProductFromHost(host) === "lounge";
}

export function isStudioDomain(host: string) {
  return getProductFromHost(host) === "studio";
}
