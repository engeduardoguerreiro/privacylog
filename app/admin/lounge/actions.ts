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

const IMAGE_BUCKET = "clinicas-mapa";

/** Recebe a imagem ja redimensionada no cliente e sobe com a service role,
 *  evitando depender de policies de storage para o usuario do navegador. */
export async function uploadMapClinicImage(formData: FormData) {
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
    .from(IMAGE_BUCKET)
    .upload(name, bytes, { contentType: "image/webp", upsert: false });

  if (error) {
    throw new Error(`Falha ao enviar a imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(name);

  return data.publicUrl;
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveMapClinic(formData: FormData) {
  await requireAdmin();

  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const nome = text(formData, "nome");

  if (!nome) {
    throw new Error("Informe o nome do local.");
  }

  let imagens: string[] = [];

  try {
    const parsed = JSON.parse(text(formData, "imagens") || "[]");
    if (Array.isArray(parsed)) {
      imagens = parsed.filter((item) => typeof item === "string").slice(0, 3);
    }
  } catch {
    imagens = [];
  }

  const payload = {
    nome,
    descricao: text(formData, "descricao") || null,
    contato: text(formData, "contato"),
    site: text(formData, "site") || null,
    endereco: text(formData, "endereco"),
    bairro: text(formData, "bairro"),
    cidade: text(formData, "cidade"),
    estado: text(formData, "estado"),
    lat: numberOrNull(formData, "lat"),
    lng: numberOrNull(formData, "lng"),
    preco_30_normal: numberOrNull(formData, "preco_30_normal"),
    preco_30_forista: numberOrNull(formData, "preco_30_forista"),
    preco_60_normal: numberOrNull(formData, "preco_60_normal"),
    preco_60_forista: numberOrNull(formData, "preco_60_forista"),
    tipo: text(formData, "tipo"),
    plano: text(formData, "plano"),
    horarios: {
      weekday: [
        {
          open: text(formData, "weekday_open"),
          close: text(formData, "weekday_close"),
        },
      ],
      saturday: [
        {
          open: text(formData, "saturday_open"),
          close: text(formData, "saturday_close"),
        },
      ],
      sunday: [
        {
          open: text(formData, "sunday_open"),
          close: text(formData, "sunday_close"),
        },
      ],
    },
    imagens: JSON.stringify(imagens, null, 2),
  };

  const rawId = text(formData, "id");
  const id = rawId ? Number(rawId) : null;

  if (id && Number.isFinite(id)) {
    const { error } = await supabase
      .from("clinicas")
      .update(payload)
      .eq("id", id);

    if (error) {
      throw new Error(`Não foi possível salvar: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("clinicas").insert([payload]);

    if (error) {
      throw new Error(`Não foi possível cadastrar: ${error.message}`);
    }
  }

  revalidatePath("/admin/lounge");
  redirect("/admin/lounge?salvo=1");
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
