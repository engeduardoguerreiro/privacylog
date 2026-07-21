"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { isAdminUser } from "@/lib/auth/admin";
import { getApprovedStudioClinicBySlug } from "@/lib/studio/db";
import type { StudioClinic } from "@/lib/studio/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getStringList(formData: FormData, key: string) {
  return getString(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "erro";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function requireClinicAccess(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const clinic = await getApprovedStudioClinicBySlug(slug);

  if (!user || !clinic || (clinic.ownerId !== user.id && !isAdminUser(user))) {
    redirect(`/studio/clinicas/${slug}/admin/login?access=denied`);
  }

  const databaseSupabase = createAdminClient() || supabase;
  const databaseClinic = await ensureStudioClinicRecord(databaseSupabase, clinic, user.id);

  return { clinic: databaseClinic, supabase: databaseSupabase, user };
}

async function ensureStudioClinicRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clinic: StudioClinic,
  userId: string
) {
  const { data: existingClinic, error: existingError } = await supabase
    .from("studio_clinics")
    .select("id, owner_id")
    .eq("slug", clinic.slug)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingClinic?.id) {
    return {
      ...clinic,
      id: Number(existingClinic.id),
      ownerId: existingClinic.owner_id || clinic.ownerId,
    };
  }

  const { data: insertedClinic, error: insertError } = await supabase
    .from("studio_clinics")
    .insert({
      owner_id: clinic.ownerId || userId,
      name: clinic.name,
      slug: clinic.slug,
      description: clinic.description,
      short_description: clinic.shortDescription,
      business_type: clinic.businessType,
      city: clinic.city,
      state: clinic.state,
      neighborhood: clinic.neighborhood,
      address: clinic.address,
      latitude: clinic.latitude ?? null,
      longitude: clinic.longitude ?? null,
      whatsapp: clinic.whatsapp,
      phone: clinic.phone ?? null,
      instagram: clinic.instagram ?? null,
      website: clinic.website ?? null,
      logo_url: clinic.logoUrl,
      main_image_url: clinic.mainImageUrl,
      status: "approved",
      plan: clinic.plan,
      is_partner: clinic.isPartner,
      is_featured: clinic.isFeatured,
      is_verified: clinic.isVerified,
      opening_hours: clinic.openingHours,
      payment_methods: clinic.paymentMethods,
      services: clinic.services,
      rules: clinic.rules,
    })
    .select("id, owner_id")
    .limit(1)
    .maybeSingle();

  if (insertError || !insertedClinic?.id) {
    throw new Error(insertError?.message || "Nao foi possivel criar a clinica Studio no banco.");
  }

  return {
    ...clinic,
    id: Number(insertedClinic.id),
    ownerId: insertedClinic.owner_id || clinic.ownerId || userId,
  };
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function validateImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie apenas imagens.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Cada imagem pode ter no maximo 10 MB.");
  }
}

async function optimizeImage(file: File) {
  validateImage(file);
  const input = Buffer.from(await file.arrayBuffer());

  return sharp(input)
    .rotate()
    .resize({
      width: 1400,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 5,
    })
    .toBuffer();
}

async function uploadProfessionalPhoto({
  clinicId,
  file,
  professionalId,
  supabase,
  userId,
}: {
  clinicId: number;
  file: File;
  professionalId: number;
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}) {
  const path = `${userId}/clinics/${clinicId}/professionals/${professionalId}/${Date.now()}-${crypto.randomUUID()}.webp`;
  const optimized = await optimizeImage(file);
  const { error } = await supabase.storage
    .from("studio-professional-photos")
    .upload(path, optimized, {
      cacheControl: "3600",
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("studio-professional-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveProfessional(slug: string, formData: FormData) {
  try {
    const { clinic, supabase, user } = await requireClinicAccess(slug);
    const id = getString(formData, "id");
    const name = getString(formData, "name");
    const currentMainPhotoUrl = getString(formData, "currentMainPhotoUrl");
    const currentPhotos = Array.from({ length: 4 })
      .map((_, index) => getString(formData, `currentPhoto${index + 1}`))
      .filter(Boolean);
    const galleryFiles = Array.from({ length: 4 })
      .map((_, index) => getFile(formData, `photo${index + 1}`))
      .filter((file): file is File => Boolean(file));

    if (!name) {
      redirect(`/studio/clinicas/${slug}/admin/profissionais?error=nome`);
    }

    const payload = {
      clinic_id: clinic.id,
      stage_name: name,
      slug: slugify(name),
      short_description: getString(formData, "shortDescription"),
      bio: getString(formData, "shortDescription"),
      main_photo_url: currentMainPhotoUrl || currentPhotos[0] || null,
      status: formData.get("availableToday") === "on" ? "available_today" : "unavailable",
      is_public: formData.get("active") === "on",
      tags: getStringList(formData, "specialties"),
      services: getStringList(formData, "specialties"),
    };

    const professionalId = id
      ? await updateProfessionalRecord({
          clinicId: clinic.id,
          id: Number(id),
          payload,
          supabase,
        })
      : await createProfessionalRecord({
          clinicId: clinic.id,
          payload,
          slug: payload.slug,
          supabase,
        });

    const uploadedGalleryPhotos = [];

    for (const file of galleryFiles) {
      uploadedGalleryPhotos.push(
        await uploadProfessionalPhoto({
            clinicId: clinic.id,
            file,
            professionalId,
            supabase,
            userId: user.id,
          })
      );
    }

    const mainPhotoUrl =
      uploadedGalleryPhotos[0] || currentPhotos[0] || currentMainPhotoUrl || null;
    const galleryPhotos = [
      mainPhotoUrl,
      ...uploadedGalleryPhotos,
      ...currentPhotos.filter((photo) => photo !== mainPhotoUrl),
    ]
      .filter((photo): photo is string => Boolean(photo))
      .slice(0, 4);

    if (mainPhotoUrl) {
      await supabase
        .from("studio_professionals")
        .update({ main_photo_url: mainPhotoUrl })
        .eq("id", professionalId)
        .eq("clinic_id", clinic.id);
    }

    await supabase
      .from("studio_professional_photos")
      .delete()
      .eq("professional_id", professionalId);

    const photoRows = galleryPhotos.map((image_url, position) => ({
      professional_id: professionalId,
      image_url,
      position,
      is_main: position === 0,
    }));

    if (photoRows.length) {
      const { error: photoError } = await supabase.from("studio_professional_photos").insert(photoRows);

      if (photoError) {
        throw new Error(photoError.message);
      }
    }

    revalidatePath(`/studio/clinicas/${slug}`);
    revalidatePath(`/studio/clinicas/${slug}/admin/profissionais`);
    redirect(`/studio/clinicas/${slug}/admin/profissionais?status=salvo`);
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Erro ao salvar profissional Studio", error);
    redirect(`/studio/clinicas/${slug}/admin/profissionais?error=${encodeURIComponent(getErrorMessage(error))}`);
  }
}

async function createProfessionalRecord({
  clinicId,
  payload,
  slug,
  supabase,
}: {
  clinicId: number;
  payload: Record<string, unknown>;
  slug: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const { data, error } = await supabase
    .from("studio_professionals")
    .insert(payload)
    .select("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data?.id) {
    return Number(data.id);
  }

  const { data: savedProfessional, error: lookupError } = await supabase
    .from("studio_professionals")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError || !savedProfessional?.id) {
    throw new Error(lookupError?.message || "Nao foi possivel localizar a profissional para salvar.");
  }

  return Number(savedProfessional.id);
}

async function updateProfessionalRecord({
  clinicId,
  id,
  payload,
  supabase,
}: {
  clinicId: number;
  id: number;
  payload: Record<string, unknown>;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const { error } = await supabase
    .from("studio_professionals")
    .update(payload)
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) {
    throw new Error(error.message);
  }

  return id;
}

export async function toggleProfessional(slug: string, id: number, available: boolean) {
  const { clinic, supabase } = await requireClinicAccess(slug);
  await supabase
    .from("studio_professionals")
    .update({ status: available ? "available_today" : "unavailable", is_public: true })
    .eq("id", id)
    .eq("clinic_id", clinic.id);

  revalidatePath(`/studio/clinicas/${slug}`);
  revalidatePath(`/studio/clinicas/${slug}/admin/profissionais`);
}

export async function removeProfessional(slug: string, id: number) {
  try {
    const { clinic, supabase } = await requireClinicAccess(slug);
    const { data, error } = await supabase
      .from("studio_professionals")
      .delete()
      .eq("id", id)
      .eq("clinic_id", clinic.id)
      .select("id")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error("Essa profissional nao existe no banco. Atualize a pagina e tente novamente.");
    }

    revalidatePath(`/studio/clinicas/${slug}`);
    revalidatePath(`/studio/clinicas/${slug}/admin/profissionais`);
    redirect(`/studio/clinicas/${slug}/admin/profissionais?status=excluido`);
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Erro ao excluir profissional Studio", error);
    redirect(`/studio/clinicas/${slug}/admin/profissionais?error=${encodeURIComponent(getErrorMessage(error))}`);
  }
}
