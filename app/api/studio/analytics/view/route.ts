import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const clinicId = Number(payload?.clinicId);
    const clinicSlug = typeof payload?.clinicSlug === "string" ? payload.clinicSlug : "";

    if (!Number.isFinite(clinicId) || clinicId <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Endpoint publico que grava com service role: limita por IP para evitar
    // inflar metricas ou encher a tabela. Ao estourar, ignora sem erro.
    const ip = getClientIp(request.headers);
    if (!checkRateLimit({ key: `studio-view:${ip}`, limit: 120, windowMs: 60_000 }).allowed) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const { error } = await supabase.from("studio_page_views").insert({
      clinic_id: clinicId,
      clinic_slug: clinicSlug,
      path: new URL(request.url).pathname,
      user_agent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    });

    if (error) {
      console.warn("Studio page view not stored", error.message);
      return NextResponse.json({ ok: true, stored: false });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
