import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const clinicId = Number(payload?.clinicId);
    const clinicSlug = typeof payload?.clinicSlug === "string" ? payload.clinicSlug : "";
    const professionalId = payload?.professionalId ? Number(payload.professionalId) : null;
    const source = typeof payload?.source === "string" ? payload.source.slice(0, 80) : "clinic_landing";

    if (!Number.isFinite(clinicId) || clinicId <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const { error } = await supabase.from("studio_whatsapp_clicks").insert({
      clinic_id: clinicId,
      clinic_slug: clinicSlug,
      professional_id: Number.isFinite(professionalId) ? professionalId : null,
      source,
      user_agent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    });

    if (error) {
      console.warn("Studio WhatsApp click not stored", error.message);
      return NextResponse.json({ ok: true, stored: false });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
