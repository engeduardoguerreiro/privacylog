"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateClinic(formData: FormData) {
  await requireAdmin();

  const id = getClinicId(formData);
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const name = text(formData, "name");

  if (!name) {
    throw new Error("Informe o nome da clínica.");
  }

  const payload = {
    name,
    slug: text(formData, "slug"),
    short_description: text(formData, "short_description") || null,
    description: text(formData, "description") || null,
    business_type: text(formData, "business_type") || null,
    city: text(formData, "city") || null,
    state: text(formData, "state") || null,
    neighborhood: text(formData, "neighborhood") || null,
    address: text(formData, "address") || null,
    whatsapp: text(formData, "whatsapp") || null,
    phone: text(formData, "phone") || null,
    instagram: text(formData, "instagram") || null,
    website: text(formData, "website") || null,
    plan: text(formData, "plan") || null,
    status: text(formData, "status") || null,
    is_partner: formData.get("is_partner") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_verified: formData.get("is_verified") === "on",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("studio_clinics")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível salvar: ${error.message}`);
  }

  revalidatePath("/admin/studio/clinicas");
  redirect("/admin/studio/clinicas");
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
