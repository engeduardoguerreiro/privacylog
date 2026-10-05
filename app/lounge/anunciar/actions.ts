"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

function field(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) || "").trim().slice(0, maxLength);
}

/**
 * Pedido de anuncio no Lounge. Antes era um form com action="mailto:", que a
 * CSP (form-action 'self') bloqueia; agora cai na mesma fila de leads do
 * admin (/admin/studio/leads), marcado como interesse "lounge".
 */
export async function submitLoungeLead(formData: FormData) {
  const payload = {
    clinic_name: field(formData, "estabelecimento", 120),
    responsible_name: field(formData, "responsavel", 120) || null,
    whatsapp: field(formData, "whatsapp", 40).replace(/\D/g, "").slice(0, 15),
    city: field(formData, "cidade", 80),
    business_type: field(formData, "tipo", 40) || null,
    interested_plan: "lounge",
    message: field(formData, "mensagem", 2000) || null,
    status: "new",
  };

  if (!payload.clinic_name || !payload.city || !payload.whatsapp) {
    redirect("/lounge/anunciar?status=incompleto");
  }

  const limit = await checkRateLimit({
    key: `lounge-lead:${getClientIp(await headers())}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    redirect("/lounge/anunciar?status=pendente");
  }

  let destination = "/lounge/anunciar?status=recebido";

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("studio_leads").insert(payload);

    if (error) {
      console.error("Lounge: falha ao registrar pedido de anuncio", error);
      destination = "/lounge/anunciar?status=pendente";
    }
  } catch {
    destination = "/lounge/anunciar?status=pendente";
  }

  redirect(destination);
}
