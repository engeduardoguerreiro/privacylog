import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostico de ambiente: diz QUAIS variaveis a producao esta enxergando,
 * sem nunca expor os valores. Util para confirmar deploy/config.
 */
export async function GET() {
  const present = (value?: string) => Boolean(value && value.trim());

  // Metadados da anon key (nao expoe a chave): so tamanho e as pontas,
  // para comparar com o valor correto sem vazar o segredo.
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const anonMeta = anon
    ? `${anon.length} chars, ${anon.slice(0, 6)}...${anon.slice(-4)}`
    : null;

  return NextResponse.json({
    ok: true,
    deployedAt: new Date().toISOString(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    anonKeyMeta: anonMeta,
    env: {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
      SUPABASE_URL: present(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_ANON_KEY: present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: present(process.env.SUPABASE_SERVICE_ROLE_KEY),
      MERCADOPAGO_ACCESS_TOKEN: present(
        process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN
      ),
      MERCADOPAGO_WEBHOOK_SECRET: present(
        process.env.MERCADOPAGO_WEBHOOK_SECRET ||
          process.env.MERCADO_PAGO_WEBHOOK_SECRET
      ),
      CRON_SECRET: present(process.env.CRON_SECRET),
    },
  });
}
