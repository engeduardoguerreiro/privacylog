"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitStudioLead(formData: FormData) {
  const payload = {
    clinic_name: String(formData.get("clinic_name") || "").trim(),
    responsible_name: String(formData.get("responsible_name") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").replace(/\D/g, ""),
    city: String(formData.get("city") || "").trim(),
    neighborhood: String(formData.get("neighborhood") || "").trim(),
    business_type: String(formData.get("business_type") || "").trim(),
    has_photos: formData.get("has_photos") === "on",
    has_domain: formData.get("has_domain") === "on",
    professionals_count: Number(formData.get("professionals_count") || 0),
    interested_plan: String(formData.get("interested_plan") || "premium"),
    message: String(formData.get("message") || "").trim(),
    status: "new",
  };

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
