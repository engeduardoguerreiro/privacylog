import { supabase } from "@/lib/supabase";

/** "São Bernardo do Campo" -> "sao-bernardo-do-campo". */
export function slugifyCity(city: string) {
  return city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type LoungeCity = { name: string; slug: string; count: number };

/**
 * Cidades com locais no mapa, a partir do proprio banco. Antes o slug era
 * convertido por um mapa fixo de 6 cidades e o resto perdia o acento
 * ("santo-andre" -> "Santo Andre"), e a busca nao achava nada.
 */
export async function getLoungeCities(): Promise<LoungeCity[]> {
  const { data, error } = await supabase.from("clinicas").select("cidade");

  if (error) {
    console.error("Lounge: falha ao carregar cidades", error);
    return [];
  }

  const cities = new Map<string, LoungeCity>();

  for (const row of (data || []) as { cidade: string | null }[]) {
    const name = row.cidade?.trim();

    if (!name) continue;

    const slug = slugifyCity(name);
    const current = cities.get(slug);
    cities.set(slug, { name: current?.name || name, slug, count: (current?.count || 0) + 1 });
  }

  return Array.from(cities.values()).sort((a, b) => b.count - a.count);
}

export async function getLoungeCityBySlug(slug: string) {
  return (await getLoungeCities()).find((city) => city.slug === slug) || null;
}
