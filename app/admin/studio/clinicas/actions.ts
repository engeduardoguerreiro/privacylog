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

function list(formData: FormData, key: string) {
  return text(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Uma linha por dia, no formato "Segunda: 11:00 as 23:00". */
function parseOpeningHours(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");

      if (separator === -1) {
        return { day: line, hours: "" };
      }

      return {
        day: line.slice(0, separator).trim(),
        hours: line.slice(separator + 1).trim(),
      };
    });
}

const CLINIC_BUCKET = "studio-clinic-photos";

/** Sobe a imagem (ja redimensionada no cliente) com a service role. */
export async function uploadClinicImage(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Arquivo inválido.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Imagem muito grande (máximo 5 MB).");
  }

  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(CLINIC_BUCKET)
    .upload(name, bytes, { contentType: "image/webp", upsert: false });

  if (error) {
    throw new Error(`Falha ao enviar a imagem: ${error.message}`);
  }

  return supabase.storage.from(CLINIC_BUCKET).getPublicUrl(name).data.publicUrl;
}

/** Logotipo e tema de cores da pagina publica da clinica. */
export async function saveClinicIdentity(formData: FormData) {
  await requireAdmin();

  const id = getClinicId(formData);
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const theme = text(formData, "theme") || "champagne";
  const logoUrl = text(formData, "logo_url");

  const { error } = await supabase
    .from("studio_clinics")
    .update({
      logo_url: logoUrl || null,
      theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    // A coluna 'theme' so existe apos rodar a migration
    // 20260723000000_studio_clinic_theme.sql
    throw new Error(`Não foi possível salvar a identidade: ${error.message}`);
  }

  revalidatePath(`/admin/studio/clinicas/${id}/editar`);
}

/** Substitui a galeria da casa pelo conjunto informado. */
export async function saveClinicPhotos(formData: FormData) {
  await requireAdmin();

  const id = getClinicId(formData);
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  let urls: string[] = [];

  try {
    const parsed = JSON.parse(text(formData, "photos") || "[]");
    if (Array.isArray(parsed)) {
      urls = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    urls = [];
  }

  await supabase.from("studio_clinic_photos").delete().eq("clinic_id", id);

  if (urls.length) {
    const rows = urls.map((image_url, position) => ({
      clinic_id: id,
      image_url,
      position,
    }));

    const { error } = await supabase.from("studio_clinic_photos").insert(rows);

    if (error) {
      throw new Error(`Não foi possível salvar as fotos: ${error.message}`);
    }
  }

  revalidatePath(`/admin/studio/clinicas/${id}/editar`);
}

export async function saveProfessional(formData: FormData) {
  await requireAdmin();

  const clinicId = getClinicId(formData);
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const stageName = text(formData, "stage_name");

  if (!stageName) {
    throw new Error("Informe o nome da modelo.");
  }

  const ageRaw = text(formData, "age");
  const age = ageRaw ? Number(ageRaw) : null;

  const payload = {
    clinic_id: clinicId,
    stage_name: stageName,
    slug: text(formData, "slug") || slugify(stageName),
    age: Number.isFinite(age) ? age : null,
    short_description: text(formData, "short_description") || null,
    bio: text(formData, "bio") || null,
    main_photo_url: text(formData, "main_photo_url") || null,
    status: text(formData, "status") || "active",
    is_featured: formData.get("is_featured") === "on",
    is_public: formData.get("is_public") === "on",
    tags: list(formData, "tags"),
    services: list(formData, "services"),
    updated_at: new Date().toISOString(),
  };

  const professionalId = text(formData, "professional_id");

  if (professionalId) {
    const { error } = await supabase
      .from("studio_professionals")
      .update(payload)
      .eq("id", Number(professionalId));

    if (error) {
      throw new Error(`Não foi possível salvar a modelo: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from("studio_professionals")
      .insert([payload]);

    if (error) {
      throw new Error(`Não foi possível cadastrar a modelo: ${error.message}`);
    }
  }

  revalidatePath(`/admin/studio/clinicas/${clinicId}/editar`);
}

export async function deleteProfessional(formData: FormData) {
  await requireAdmin();

  const clinicId = getClinicId(formData);
  const professionalId = Number(text(formData, "professional_id"));

  if (!Number.isFinite(professionalId) || professionalId <= 0) {
    throw new Error("Modelo inválida.");
  }

  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const { error } = await supabase
    .from("studio_professionals")
    .delete()
    .eq("id", professionalId);

  if (error) {
    throw new Error(`Não foi possível excluir: ${error.message}`);
  }

  revalidatePath(`/admin/studio/clinicas/${clinicId}/editar`);
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
    main_image_url: text(formData, "main_image_url") || null,
    rules: text(formData, "rules") || null,
    services: list(formData, "services"),
    payment_methods: list(formData, "payment_methods"),
    opening_hours: parseOpeningHours(text(formData, "opening_hours")),
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
