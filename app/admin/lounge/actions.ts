"use server";

import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || !isAdminUser(user)) {
    throw new Error("Acesso restrito ao administrador.");
  }
}

export async function deleteMapClinic(formData: FormData) {
  await requireAdmin();

  const raw = formData.get("id");
  const id = Number(typeof raw === "string" ? raw : "");

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Clínica inválida.");
  }

  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const { error } = await supabase.from("clinicas").delete().eq("id", id);

  if (error) {
    throw new Error(`Não foi possível excluir: ${error.message}`);
  }

  revalidatePath("/admin/lounge");
}
