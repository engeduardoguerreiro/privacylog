import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";

export type OwnedClinic = {
  id: number;
  name: string;
  slug: string;
  plan: string | null;
  status: string | null;
  subscription_status: string | null;
  subscription_until: string | null;
};

/**
 * A casa que o usuario logado administra. O painel inteiro depende disso
 * para saber de quem sao os dados exibidos.
 */
export async function getClinicForCurrentUser(): Promise<OwnedClinic | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("studio_clinics")
    .select("id, name, slug, plan, status, subscription_status, subscription_until")
    .eq("owner_id", user.id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Painel: falha ao carregar a casa do usuario", error);
    return null;
  }

  return (data as OwnedClinic | null) ?? null;
}

/**
 * Id da casa do usuario logado, para uso nas server actions do painel.
 * Nunca confiamos num id vindo do formulario: o dono so mexe na propria casa.
 */
export async function requireOwnedClinicId(): Promise<number> {
  const clinic = await getClinicForCurrentUser();

  if (!clinic) {
    throw new Error("Nenhuma casa vinculada a esta conta.");
  }

  return clinic.id;
}

export type OwnedProfessional = {
  id: number;
  stage_name: string | null;
  slug: string | null;
  age: number | null;
  short_description: string | null;
  bio: string | null;
  main_photo_url: string | null;
  status: string | null;
  is_featured: boolean | null;
  is_public: boolean | null;
  tags: unknown;
  services: unknown;
};

export type OwnedClinicEditor = {
  clinic: Record<string, unknown> & { id: number };
  photos: string[];
  professionals: OwnedProfessional[];
};

/** Casa completa do dono (dados + fotos + modelos) para as telas do painel. */
export async function getOwnedClinicEditor(): Promise<OwnedClinicEditor | null> {
  const user = await getCurrentUser();

  if (!user) return null;

  const supabase = createAdminClient();

  if (!supabase) return null;

  const { data: clinic, error } = await supabase
    .from("studio_clinics")
    .select("*")
    .eq("owner_id", user.id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !clinic) {
    return null;
  }

  const clinicId = (clinic as { id: number }).id;

  const [photosResult, professionalsResult] = await Promise.all([
    supabase
      .from("studio_clinic_photos")
      .select("image_url")
      .eq("clinic_id", clinicId)
      .order("position", { ascending: true }),
    supabase
      .from("studio_professionals")
      .select(
        "id, stage_name, slug, age, short_description, bio, main_photo_url, status, is_featured, is_public, tags, services"
      )
      .eq("clinic_id", clinicId)
      .order("id", { ascending: true }),
  ]);

  const photos = (photosResult.data || [])
    .map((row) => (row as { image_url?: string }).image_url)
    .filter((url): url is string => typeof url === "string");

  return {
    clinic: clinic as Record<string, unknown> & { id: number },
    photos,
    professionals: (professionalsResult.data || []) as OwnedProfessional[],
  };
}
