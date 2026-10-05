import { normalizeHost } from "@/lib/subdomain";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

const privacyLogDomain = "privacylog.com.br";
const reservedSubdomains = new Set([
  "www",
  "lounge",
  "forum",
  "club",
  "studio",
  "admin",
  "api",
]);

// O proxy roda a cada request: guarda a resposta (inclusive "nao achei")
// por alguns minutos para nao consultar o banco em toda navegacao.
const cacheTtlMs = 5 * 60 * 1000;
const slugCache = new Map<string, { slug: string | null; expiresAt: number }>();

/** Filtro PostgREST: valores com ponto precisam de aspas dentro do or=(). */
function quote(value: string) {
  return `"${value.replace(/["\\]/g, "")}"`;
}

/**
 * Qual filtro procurar para este host, ou null se o host nunca e de uma casa
 * (raiz, subdominios reservados, previews da Vercel).
 */
function getLookupFilter(host: string) {
  if (host === privacyLogDomain || host.endsWith(".vercel.app")) {
    return null;
  }

  if (host.endsWith(`.${privacyLogDomain}`)) {
    const subdomain = host.slice(0, host.length - privacyLogDomain.length - 1);

    if (!subdomain || reservedSubdomains.has(subdomain) || subdomain.includes(".")) {
      return null;
    }

    return `(${[
      `clinic_subdomain.eq.${quote(subdomain)}`,
      `clinic_subdomain.eq.${quote(host)}`,
      `slug.eq.${quote(subdomain)}`,
    ].join(",")})`;
  }

  // Dominio proprio da casa, com ou sem www.
  const alternate = host.startsWith("www.") ? host.slice(4) : `www.${host}`;

  return `(custom_domain.eq.${quote(host)},custom_domain.eq.${quote(alternate)})`;
}

async function lookupSlug(filter: string) {
  const url = new URL(`${supabaseUrl}/rest/v1/studio_clinics`);
  url.searchParams.set("select", "slug");
  url.searchParams.set("status", "eq.approved");
  url.searchParams.set("or", filter);
  url.searchParams.set("limit", "1");

  // Chave publica + RLS: so enxerga casas aprovadas.
  const response = await fetch(url, {
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Studio: falha ao resolver dominio (${response.status})`);
  }

  const rows = (await response.json()) as Array<{ slug?: string }>;
  return rows[0]?.slug || null;
}

/** Slug da casa publicada neste subdominio/dominio proprio, se houver. */
export async function getStudioClinicSlugFromHost(host: string) {
  const normalizedHost = normalizeHost(host);
  const filter = normalizedHost ? getLookupFilter(normalizedHost) : null;

  if (!filter) {
    return null;
  }

  const cached = slugCache.get(normalizedHost);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.slug;
  }

  try {
    const slug = await lookupSlug(filter);
    slugCache.set(normalizedHost, { slug, expiresAt: Date.now() + cacheTtlMs });
    return slug;
  } catch (error) {
    // Sem banco, cai no site principal em vez de derrubar a navegacao.
    console.error(error);
    return null;
  }
}
