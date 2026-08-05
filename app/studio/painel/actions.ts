"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnedClinicId } from "@/lib/studio/owner";

function admin() {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Cadastro indisponivel no momento. Fale com o PrivacyLog.");
  }

  return supabase;
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
      if (separator === -1) return { day: line, hours: "" };
      return {
        day: line.slice(0, separator).trim(),
        hours: line.slice(separator + 1).trim(),
      };
    });
}

const CLINIC_BUCKET = "studio-clinic-photos";

/** Sobe a imagem (ja redimensionada no cliente). */
export async function uploadOwnImage(formData: FormData) {
  await requireOwnedClinicId();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Arquivo invalido.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Imagem muito grande (maximo 5 MB).");
  }

  const supabase = admin();
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

/** Dados publicos da casa (perfil). */
export async function updateOwnClinic(formData: FormData) {
  const clinicId = await requireOwnedClinicId();

  const name = text(formData, "name");

  if (!name) {
    throw new Error("Informe o nome da casa.");
  }

  const { error } = await admin()
    .from("studio_clinics")
    .update({
      name,
      short_description: text(formData, "short_description") || null,
      description: text(formData, "description") || null,
      city: text(formData, "city") || null,
      state: text(formData, "state").toUpperCase().slice(0, 2) || null,
      neighborhood: text(formData, "neighborhood") || null,
      address: text(formData, "address") || null,
      whatsapp: text(formData, "whatsapp") || null,
      phone: text(formData, "phone") || null,
      instagram: text(formData, "instagram") || null,
      website: text(formData, "website") || null,
      rules: text(formData, "rules") || null,
      services: list(formData, "services"),
      payment_methods: list(formData, "payment_methods"),
      opening_hours: parseOpeningHours(text(formData, "opening_hours")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", clinicId);

  if (error) {
    throw new Error(`Nao foi possivel salvar: ${error.message}`);
  }

  revalidatePath("/studio/painel/perfil");
}

/** Logotipo e tema de cores da pagina publica. */
export async function saveOwnIdentity(formData: FormData) {
  const clinicId = await requireOwnedClinicId();

  const theme = text(formData, "theme") || "champagne";
  const logoUrl = text(formData, "logo_url");
  const mainImageUrl = text(formData, "main_image_url");

  const { error } = await admin()
    .from("studio_clinics")
    .update({
      theme,
      logo_url: logoUrl || null,
      ...(mainImageUrl ? { main_image_url: mainImageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", clinicId);

  if (error) {
    throw new Error(`Nao foi possivel salvar a identidade: ${error.message}`);
  }

  revalidatePath("/studio/painel/site");
}

/** Substitui a galeria da casa. */
export async function saveOwnPhotos(formData: FormData) {
  const clinicId = await requireOwnedClinicId();
  const supabase = admin();

  let urls: string[] = [];

  try {
    const parsed = JSON.parse(text(formData, "photos") || "[]");
    if (Array.isArray(parsed)) {
      urls = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    urls = [];
  }

  await supabase.from("studio_clinic_photos").delete().eq("clinic_id", clinicId);

  if (urls.length) {
    const rows = urls.map((image_url, position) => ({
      clinic_id: clinicId,
      image_url,
      position,
    }));

    const { error } = await supabase.from("studio_clinic_photos").insert(rows);

    if (error) {
      throw new Error(`Nao foi possivel salvar as fotos: ${error.message}`);
    }
  }

  revalidatePath("/studio/painel/fotos");
}

/** Garante que a modelo pertence a casa do dono antes de qualquer mudanca. */
async function assertProfessionalOwnership(
  supabase: ReturnType<typeof createAdminClient>,
  professionalId: number,
  clinicId: number
) {
  if (!supabase) return false;

  const { data } = await supabase
    .from("studio_professionals")
    .select("clinic_id")
    .eq("id", professionalId)
    .maybeSingle();

  return (data as { clinic_id?: number } | null)?.clinic_id === clinicId;
}

export async function saveOwnProfessional(formData: FormData) {
  const clinicId = await requireOwnedClinicId();
  const supabase = admin();

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
    status: text(formData, "status") || "unavailable",
    is_featured: formData.get("is_featured") === "on",
    is_public: formData.get("is_public") === "on",
    tags: list(formData, "tags"),
    services: list(formData, "services"),
    updated_at: new Date().toISOString(),
  };

  const professionalId = Number(text(formData, "professional_id"));

  if (professionalId) {
    const owns = await assertProfessionalOwnership(supabase, professionalId, clinicId);

    if (!owns) {
      throw new Error("Modelo invalida.");
    }

    const { error } = await supabase
      .from("studio_professionals")
      .update(payload)
      .eq("id", professionalId);

    if (error) {
      throw new Error(`Nao foi possivel salvar a modelo: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("studio_professionals").insert([payload]);

    if (error) {
      throw new Error(`Nao foi possivel cadastrar a modelo: ${error.message}`);
    }
  }

  revalidatePath("/studio/painel/massagistas");
  revalidatePath("/studio/painel/disponibilidade");
}

export async function deleteOwnProfessional(formData: FormData) {
  const clinicId = await requireOwnedClinicId();
  const supabase = admin();
  const professionalId = Number(text(formData, "professional_id"));

  if (!Number.isFinite(professionalId) || professionalId <= 0) {
    throw new Error("Modelo invalida.");
  }

  const owns = await assertProfessionalOwnership(supabase, professionalId, clinicId);

  if (!owns) {
    throw new Error("Modelo invalida.");
  }

  const { error } = await supabase
    .from("studio_professionals")
    .delete()
    .eq("id", professionalId);

  if (error) {
    throw new Error(`Nao foi possivel excluir: ${error.message}`);
  }

  revalidatePath("/studio/painel/massagistas");
  revalidatePath("/studio/painel/disponibilidade");
}

/** Disponibilidade do dia: so muda o status da modelo. */
export async function setOwnProfessionalStatus(formData: FormData) {
  const clinicId = await requireOwnedClinicId();
  const supabase = admin();
  const professionalId = Number(text(formData, "professional_id"));
  const status = text(formData, "status");

  const allowed = ["available_now", "available_today", "booked", "unavailable"];

  if (!allowed.includes(status)) {
    throw new Error("Status invalido.");
  }

  const owns = await assertProfessionalOwnership(supabase, professionalId, clinicId);

  if (!owns) {
    throw new Error("Modelo invalida.");
  }

  const { error } = await supabase
    .from("studio_professionals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", professionalId);

  if (error) {
    throw new Error(`Nao foi possivel atualizar: ${error.message}`);
  }

  revalidatePath("/studio/painel/disponibilidade");
  revalidatePath("/studio/painel");
}
