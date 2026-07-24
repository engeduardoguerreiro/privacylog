import { NextResponse } from "next/server";
import { expireOverdueSubscriptions } from "@/lib/billing/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rede de seguranca diaria: derruba as casas cuja assinatura venceu e cujo
 * aviso de renovacao nunca chegou. Chamado pelo cron da Vercel.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  // Em producao o cron da Vercel manda o Authorization: Bearer <CRON_SECRET>.
  if (secret) {
    const header = request.headers.get("authorization");

    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
    }
  }

  try {
    const suspended = await expireOverdueSubscriptions();

    return NextResponse.json({
      ok: true,
      suspensas: suspended.length,
      clinicas: suspended,
    });
  } catch (error) {
    console.error("Cobranca: falha ao expirar assinaturas", error);

    return NextResponse.json({ error: "falha ao expirar" }, { status: 500 });
  }
}
