"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

/** Texto do formulario aparado e com tamanho maximo (evita spam gigante). */
function field(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) || "").trim().slice(0, maxLength);
}

export async function submitStudioLead(formData: FormData) {
  const professionalsCount = Number(formData.get("professionals_count") || 0);
  const payload = {
    clinic_name: field(formData, "clinic_name", 120),
    responsible_name: field(formData, "responsible_name", 120),
    whatsapp: field(formData, "whatsapp", 40).replace(/\D/g, "").slice(0, 15),
    city: field(formData, "city", 80),
    neighborhood: field(formData, "neighborhood", 80),
    business_type: field(formData, "business_type", 40),
    has_photos: formData.get("has_photos") === "on",
    has_domain: formData.get("has_domain") === "on",
    professionals_count: Number.isFinite(professionalsCount)
      ? Math.min(Math.max(Math.trunc(professionalsCount), 0), 500)
      : 0,
    interested_plan: field(formData, "interested_plan", 20) || "premium",
    message: field(formData, "message", 2000),
    status: "new",
  };

  const leadLimit = await checkRateLimit({
    key: `studio-lead:${getClientIp(await headers())}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!leadLimit.allowed) {
    redirect("/studio/solicitar-site?status=pendente");
  }

  let destination = "/studio/solicitar-site?status=recebido";

  if (!payload.clinic_name || !payload.responsible_name || !payload.whatsapp) {
    destination = "/studio/solicitar-site?status=incompleto";
  } else {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("studio_leads").insert(payload);

      if (error) {
        destination = "/studio/solicitar-site?status=pendente";
      }
    } catch {
      destination = "/studio/solicitar-site?status=pendente";
    }
  }

  redirect(destination);
}
