"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { isAdminUser } from "@/lib/auth/admin";
import { getApprovedStudioClinicBySlug } from "@/lib/studio/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ClinicPhotoFormState = {
  type: "idle" | "success" | "error";
  message: string;
};

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "erro";

  if (message.toLowerCase().includes("bucket not found")) {
    return "Bucket do Supabase Storage não encontrado. Execute o SQL de criação dos buckets do Studio antes de enviar imagens.";
  }

  return message;
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

  return {
    clinic,
    supabase: createAdminClient() || supabase,
    user,
  };
}

function validateImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie apenas imagens.");
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Cada imagem pode ter no máximo 12 MB.");
  }
}

async function optimizeClinicPhoto(file: File) {
  validateImage(file);
  const input = Buffer.from(await file.arrayBuffer());

  return sharp(input)
    .rotate()
    .resize({
      width: 1800,
      height: 1200,
      fit: "cover",
      position: "attention",
      withoutEnlargement: true,
    })
    .webp({
      quality: 84,
      effort: 5,
    })
    .toBuffer();
}

async function uploadClinicPhoto({
  clinicId,
  file,
  position,
  supabase,
  userId,
}: {
  clinicId: number;
  file: File;
  position: number;
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}) {
  const optimized = await optimizeClinicPhoto(file);
  const path = `${userId}/clinics/${clinicId}/atmosphere/${position}-${Date.now()}-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("studio-clinic-photos")
    .upload(path, optimized, {
      cacheControl: "3600",
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("studio-clinic-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveClinicAtmospherePhotos(
  slug: string,
  _previousState: ClinicPhotoFormState,
  formData: FormData
): Promise<ClinicPhotoFormState> {
  try {
    const { clinic, supabase, user } = await requireClinicAccess(slug);
    const uploads = [];

    for (let index = 0; index < 4; index += 1) {
      const file = getFile(formData, `photo${index + 1}`);

      if (!file) {
        continue;
      }

      const imageUrl = await uploadClinicPhoto({
        clinicId: clinic.id,
        file,
        position: index,
        supabase,
        userId: user.id,
      });

      uploads.push({ image_url: imageUrl, position: index });
    }

    if (!uploads.length) {
      return {
        type: "error",
        message: "Selecione ao menos uma imagem.",
      };
    }

    for (const photo of uploads) {
      const { error: deleteError } = await supabase
        .from("studio_clinic_photos")
        .delete()
        .eq("clinic_id", clinic.id)
        .eq("position", photo.position);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      const { error: insertError } = await supabase.from("studio_clinic_photos").insert({
        clinic_id: clinic.id,
        image_url: photo.image_url,
        position: photo.position,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    revalidatePath(`/studio/clinicas/${slug}`);
    revalidatePath(`/studio/clinicas/${slug}/admin/fotos`);

    return {
      type: "success",
      message: "Fotos atualizadas com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao salvar fotos da clínica Studio", error);
    return {
      type: "error",
      message: `Não foi possível salvar. Detalhe: ${getErrorMessage(error)}`,
    };
  }
}
