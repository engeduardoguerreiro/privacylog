import type { MetadataRoute } from "next";
import { getProductBaseUrl } from "@/lib/subdomain";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApprovedStudioClinics } from "@/lib/studio/db";

// O sitemap le o banco; uma hora de cache evita bater no Supabase a cada acesso.
export const revalidate = 3600;

/** Clinicas do mapa (tabela clinicas), publicadas em /clinica/[id]. */
async function getMapClinicIds(): Promise<number[]> {
  const supabase = createAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("clinicas").select("id");

  if (error) {
    console.error("Sitemap: falha ao carregar as clinicas do mapa", error);
    return [];
  }

  return (data || [])
    .map((row) => (row as { id?: number }).id)
    .filter((id): id is number => typeof id === "number");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const main = getProductBaseUrl("main");
  const studio = getProductBaseUrl("studio");
  const now = new Date();

  // Se o banco falhar, o sitemap ainda sai com as paginas fixas.
  const [clinics, mapClinicIds] = await Promise.all([
    getApprovedStudioClinics().catch(() => []),
    getMapClinicIds(),
  ]);

  return [
    { url: main, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${main}/lounge/mapa`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    { url: `${main}/lounge`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: studio, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${studio}/clinicas`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    { url: `${studio}/planos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${studio}/cadastro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${studio}/solicitar-site`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Casas assinantes, direto do banco.
    ...clinics.map((clinic) => ({
      url: `${studio}/clinicas/${clinic.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: clinic.plan === "black" ? 0.85 : 0.75,
    })),

    // Casas do mapa.
    ...mapClinicIds.map((id) => ({
      url: `${main}/clinica/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
