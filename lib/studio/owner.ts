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
