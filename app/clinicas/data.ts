import type { CarouselClinic } from "../_home/ClinicsCarousel";
import { slugifyCity } from "@/lib/lounge/cities";
import { getApprovedStudioClinics } from "@/lib/studio/db";
import { supabase } from "@/lib/supabase";
import type { DirectoryLocal } from "./LocalCard";

const planRank: Record<string, number> = { black: 3, premium: 2, essential: 1 };

/** Casas assinantes (paginas premium), plano mais alto primeiro. */
export async function getPartnerClinics(citySlug?: string): Promise<CarouselClinic[]> {
  const clinics = await getApprovedStudioClinics().catch(() => []);

  return clinics
    .filter((clinic) => !citySlug || slugifyCity(clinic.city) === citySlug)
    .sort((a, b) => (planRank[b.plan] || 0) - (planRank[a.plan] || 0))
    .map((clinic) => ({
      name: clinic.name,
      slug: clinic.slug,
      city: clinic.city,
      neighborhood: clinic.neighborhood,
      address: clinic.address,
      mainImageUrl: clinic.mainImageUrl,
      plan: clinic.plan,
    }));
}

/** Locais do mapa (tabela clinicas), opcionalmente de uma cidade. */
export async function getDirectoryLocals(cityName?: string): Promise<DirectoryLocal[]> {
  let query = supabase
    .from("clinicas")
    .select("id,nome,bairro,cidade,tipo,imagens")
    .order("plano", { ascending: false })
    .order("nome", { ascending: true });

  if (cityName) {
    query = query.eq("cidade", cityName);
  }

  const { data, error } = await query;

  if (error) {
    // Lanca para o ISR nao guardar uma lista vazia por causa de uma falha.
    throw new Error(`Clinicas: falha ao carregar locais: ${error.message}`);
  }

  return (data || []) as DirectoryLocal[];
}
