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

function getClinicId(formData: FormData) {
  const raw = formData.get("id");
  const id = Number(typeof raw === "string" ? raw : "");

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Clínica inválida.");
  }

  return id;
}

export async function setClinicStatus(formData: FormData) {
  await requireAdmin();

  const id = getClinicId(formData);
  const rawStatus = formData.get("status");
  const status = typeof rawStatus === "string" ? rawStatus : "";

  if (!["approved", "pending", "suspended"].includes(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const { error } = await supabase
    .from("studio_clinics")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar: ${error.message}`);
  }

  revalidatePath("/admin/studio/clinicas");
}

export async function deleteClinic(formData: FormData) {
  await requireAdmin();

  const id = getClinicId(formData);
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const { error } = await supabase.from("studio_clinics").delete().eq("id", id);

  if (error) {
    throw new Error(`Não foi possível excluir: ${error.message}`);
  }

  revalidatePath("/admin/studio/clinicas");
}
