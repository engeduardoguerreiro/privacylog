#!/usr/bin/env node

/**
 * Backup do banco PrivacyLog.
 *
 * Exporta as tabelas principais para um JSON com data/hora em backups/.
 * O Supabase gratuito nao tem backup automatico restauravel, entao rode
 * este script periodicamente e guarde o arquivo fora do projeto.
 *
 *   npm run db:backup
 *
 * Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

// Tabelas de dados. Eventos de analytics (studio_page_views,
// studio_whatsapp_clicks) ficam de fora por serem log de alto volume.
const TABLES = [
  // mapa (base critica, sem backup em nenhum outro lugar)
  "clinicas",
  // clinicas assinantes
  "studio_clinics",
  "studio_professionals",
  "studio_clinic_photos",
  "studio_professional_photos",
  "studio_professional_availability",
  "studio_leads",
  "studio_plans",
  "studio_domain_mappings",
  "studio_clinic_admins",
  "studio_whatsapp_settings",
  "studio_whatsapp_status_assets",
  // perfis / acesso
  "studio_profiles",
  "lounge_profiles",
  "profiles",
];

const PAGE_SIZE = 1000;

main().catch((error) => {
  console.error(`\nFalha no backup: ${error.message}`);
  process.exit(1);
});

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local"
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const backup = {
    generatedAt: new Date().toISOString(),
    project: url,
    tables: {},
  };

  const summary = [];

  for (const table of TABLES) {
    const result = await dumpTable(supabase, table);

    if (result.missing) {
      summary.push(`  - ${table}: (tabela nao existe, ignorada)`);
      continue;
    }

    if (result.error) {
      summary.push(`  - ${table}: ERRO ${result.error}`);
      continue;
    }

    backup.tables[table] = result.rows;
    summary.push(`  - ${table}: ${result.rows.length} registro(s)`);
  }

  const dir = path.join(process.cwd(), "backups");
  await mkdir(dir, { recursive: true });

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 16);
  const file = path.join(dir, `privacylog-backup-${stamp}.json`);

  await writeFile(file, JSON.stringify(backup, null, 2), "utf8");
  const { size } = await stat(file);

  console.log("\nBackup concluido.");
  console.log(summary.join("\n"));
  console.log(`\nArquivo: ${file}`);
  console.log(`Tamanho: ${(size / 1024).toFixed(1)} KB`);
  console.log(
    "\nGuarde uma copia fora do projeto (a pasta backups/ nao vai para o git)."
  );
}

async function dumpTable(supabase, table) {
  const rows = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      const missing =
        error.code === "42P01" ||
        /does not exist|could not find the table/i.test(error.message || "");

      return missing ? { missing: true } : { error: error.message };
    }

    rows.push(...(data || []));

    if (!data || data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return { rows };
}
