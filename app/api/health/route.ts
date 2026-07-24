import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostico de ambiente: diz QUAIS variaveis a producao esta enxergando,
 * sem nunca expor os valores. Util para confirmar deploy/config.
 */
export async function GET() {
  const present = (value?: string) => Boolean(value && value.trim());

  return NextResponse.json({
    ok: true,
    deployedAt: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
      SUPABASE_URL: present(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_ANON_KEY: present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: present(process.env.SUPABASE_SERVICE_ROLE_KEY),
      MERCADOPAGO_ACCESS_TOKEN: present(process.env.MERCADOPAGO_ACCESS_TOKEN),
      MERCADOPAGO_WEBHOOK_SECRET: present(process.env.MERCADOPAGO_WEBHOOK_SECRET),
      CRON_SECRET: present(process.env.CRON_SECRET),
    },
  });
}
