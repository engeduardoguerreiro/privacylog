import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Keep-alive do banco: o Supabase gratuito pausa o projeto apos ~7 dias sem
// atividade. Um cron do Vercel (ver vercel.json) chama esta rota periodicamente
// e faz uma consulta minima, registrando atividade no Postgres.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY nao configurada" },
      { status: 500 }
    );
  }

  const startedAt = Date.now();
  const { error } = await supabase
    .from("studio_clinics")
    .select("id")
    .limit(1);

  // Mesmo um erro de consulta significa que o Postgres foi alcancado,
  // o que ja conta como atividade e evita a pausa do projeto.
  return NextResponse.json({
    ok: true,
    reached: true,
    tableError: error?.message ?? null,
    tookMs: Date.now() - startedAt,
    ranAt: new Date().toISOString(),
  });
}
