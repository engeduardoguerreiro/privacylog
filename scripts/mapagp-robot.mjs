#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const MAPAGP_BASE_URL = "https://mapagp.com";
const USER_AGENT =
  "PrivacyLogBot/0.1 (+authorized import for privacylog.com.br)";
const DEFAULT_INCLUDE = ["clinica", "massagem", "boate", "prive"];
const KNOWN_STATES = ["SP", "MG", "RJ", "PR", "SC", "RS"];

const CATEGORY_BY_ID = new Map([
  [1, { tipo: "clinica", label: "Clínica" }],
  [2, { tipo: "massagem", label: "Massagem" }],
  [3, { tipo: "boate", label: "Boate" }],
  [4, { tipo: "prive", label: "Privê" }],
]);

const STATE_NAME_TO_CODE = new Map([
  ["sao paulo", "SP"],
  ["rio de janeiro", "RJ"],
  ["minas gerais", "MG"],
  ["parana", "PR"],
  ["santa catarina", "SC"],
  ["rio grande do sul", "RS"],
]);

const args = parseArgs(process.argv.slice(2));
const mode = args.import ? "import" : "preview";
const includeTypes = parseList(args.include, DEFAULT_INCLUDE);
const limit = parseInteger(args.limit);
const delayMs = parseInteger(args.delay) ?? 350;
const updateExisting = Boolean(args["update-existing"]);
const outputPath =
  typeof args.out === "string" && args.out.trim() ? args.out.trim() : null;

main().catch((error) => {
  console.error(`\nFalha no robô MapaGP: ${error.message}`);
  if (args.debug) {
    console.error(error);
  }
  process.exitCode = 1;
});

async function main() {
  console.log(`PrivacyLog MapaGP robot`);
  console.log(`Modo: ${mode}`);
  console.log(`Tipos: ${includeTypes.join(", ")}`);
  console.log(`Delay entre detalhes: ${delayMs}ms\n`);

  const sitemapSlugs = await fetchSitemapSlugs();
  const homePlaces = await fetchHomePlaces();
  const sourcePlaces = mergePlacesBySlug(homePlaces, sitemapSlugs);
  const selectedSources = sourcePlaces
    .map(normalizeSourcePlace)
    .filter(Boolean)
    .filter((place) => includeTypes.includes(place.tipo))
    .slice(0, limit ?? undefined);

  if (selectedSources.length === 0) {
    throw new Error("nenhum local encontrado para os filtros informados.");
  }

  console.log(
    `Encontrados ${sourcePlaces.length} locais no MapaGP; ${selectedSources.length} dentro do filtro.`
  );

  const places = await collectDetailedPlaces(selectedSources);
  const validPlaces = places.filter((place) => place.estado && place.lat && place.lng);

  printPreview(validPlaces);

  if (outputPath) {
    await writeJson(outputPath, validPlaces);
    console.log(`\nJSON exportado em ${outputPath}`);
  }

  if (mode === "preview") {
    console.log("\nPrévia concluída. Use `npm run mapagp:import` para gravar.");
    return;
  }

  const supabase = await createSupabaseAdminClient();
  const result = await importPlaces(supabase, validPlaces, {
    updateExisting,
  });

  console.log("\nImportação concluída:");
  console.log(`- Inseridos: ${result.inserted}`);
  console.log(`- Atualizados: ${result.updated}`);
  console.log(`- Duplicados ignorados: ${result.skipped}`);
  console.log(`- Categorias de fórum criadas/sincronizadas: ${result.forums}`);

  if (result.warnings.length > 0) {
    console.log("\nAvisos:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }
}

async function fetchSitemapSlugs() {
  const xml = await fetchText(`${MAPAGP_BASE_URL}/sitemap.xml`);
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .map((url) => {
      try {
        return new URL(url).pathname;
      } catch {
        return "";
      }
    })
    .filter((pathname) => pathname.startsWith("/local/"))
    .map((pathname) => pathname.replace("/local/", "").replace(/\/$/, ""));
}

async function fetchHomePlaces() {
  const state = await fetchFreshState(`${MAPAGP_BASE_URL}/`);
  const clinicsWrapper = findFirst(
    state,
    (value) =>
      value &&
      Array.isArray(value.clinics) &&
      value.clinics.some((place) => place?.seo_name)
  );

  return clinicsWrapper?.clinics || [];
}

function mergePlacesBySlug(homePlaces, sitemapSlugs) {
  const bySlug = new Map();

  for (const place of homePlaces) {
    if (place?.seo_name) {
      bySlug.set(place.seo_name, { ...place });
    }
  }

  for (const slug of sitemapSlugs) {
    if (!bySlug.has(slug)) {
      bySlug.set(slug, { seo_name: slug });
    }
  }

  return [...bySlug.values()].sort((a, b) =>
    String(a.name || a.seo_name).localeCompare(String(b.name || b.seo_name), "pt-BR")
  );
}

function normalizeSourcePlace(source) {
  const category = CATEGORY_BY_ID.get(Number(source.category));

  if (!category && source.category != null) {
    return null;
  }

  return {
    raw: source,
    seoName: String(source.seo_name || "").trim(),
    nome: String(source.name || source.seo_name || "").trim(),
    tipo: category?.tipo || null,
    tipoLabel: category?.label || null,
  };
}

async function collectDetailedPlaces(sourcePlaces) {
  const places = [];

  for (let index = 0; index < sourcePlaces.length; index += 1) {
    const source = sourcePlaces[index];
    const progress = `${index + 1}/${sourcePlaces.length}`;

    try {
      const detail = await fetchPlaceDetail(source);
      places.push(detail);
      console.log(`${progress} OK ${detail.tipoLabel} - ${detail.nome}`);
    } catch (error) {
      console.warn(`${progress} ERRO ${source.seoName}: ${error.message}`);
    }

    if (index < sourcePlaces.length - 1 && delayMs > 0) {
      await wait(delayMs);
    }
  }

  return places;
}

async function fetchPlaceDetail(source) {
  if (!source.seoName) {
    throw new Error("local sem slug.");
  }

  const state = await fetchFreshState(`${MAPAGP_BASE_URL}/local/${source.seoName}`);
  const clinicWrapper = findFirst(
    state,
    (value) => value && value.clinicData && value.clinicData.seo_name
  );
  const clinicData = clinicWrapper?.clinicData || {};
  const servicesWrapper = findFirst(
    state,
    (value) =>
      value &&
      Array.isArray(value.services) &&
      value.services.some((service) => "duration_min" in service)
  );
  const hoursWrapper = findFirst(
    state,
    (value) =>
      value &&
      Array.isArray(value.openingHours) &&
      value.openingHours.some((hour) => "day_of_week" in hour)
  );
  const merged = {
    ...source.raw,
    ...clinicData,
    services: servicesWrapper?.services || [],
    openingHours: hoursWrapper?.openingHours || [],
  };
  const category = CATEGORY_BY_ID.get(Number(merged.category)) || {
    tipo: source.tipo,
    label: source.tipoLabel,
  };
  const addressParts = parseAddressParts(String(merged.address || ""));
  const prices = parsePrices(merged.services, merged);

  return {
    source: "mapagp",
    sourceUrl: `${MAPAGP_BASE_URL}/local/${source.seoName}`,
    externalForum: toNullableString(merged.forum),
    nome: String(merged.name || source.nome || source.seoName).trim(),
    descricao:
      "Informações cadastrais em validação pelo PrivacyLog. Use o fórum para relatos e atualizações da comunidade.",
    contato: merged.contact ? onlyDigits(String(merged.contact)) : "",
    site: toNullableString(merged.site),
    endereco: String(merged.address || "").trim(),
    bairro: addressParts.bairro,
    cidade: addressParts.cidade,
    estado: addressParts.estado,
    lat: toNumberOrNull(merged.latitude),
    lng: toNumberOrNull(merged.longitude),
    tipo: category.tipo,
    tipoLabel: category.label,
    plano: "free",
    imagens: [],
    horarios: parseHours(merged.openingHours),
    preco_30_normal: prices.preco_30_normal,
    preco_30_forista: prices.preco_30_forista,
    preco_60_normal: prices.preco_60_normal,
    preco_60_forista: prices.preco_60_forista,
    avaliacaoFonte: toNumberOrNull(merged.stars),
  };
}

async function importPlaces(supabase, places, options) {
  const existing = await loadExistingClinics(supabase);
  const parents = await loadForumParents(supabase);
  const result = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    forums: 0,
    warnings: [],
  };

  for (const place of places) {
    const duplicate = findDuplicate(existing, place);
    let clinicId = duplicate?.id;

    if (duplicate && !options.updateExisting) {
      result.skipped += 1;
      continue;
    }

    if (duplicate && options.updateExisting) {
      const payload = buildClinicPayload(place, { update: true });
      const { error } = await supabase
        .from("clinicas")
        .update(payload)
        .eq("id", duplicate.id);

      if (error) {
        result.warnings.push(`${place.nome}: erro ao atualizar (${error.message})`);
        continue;
      }

      result.updated += 1;
    }

    if (!duplicate) {
      const payload = buildClinicPayload(place, { update: false });
      const { data, error } = await supabase
        .from("clinicas")
        .insert(payload)
        .select("id")
        .single();

      if (error || !data?.id) {
        result.warnings.push(
          `${place.nome}: erro ao inserir (${error?.message || "sem id retornado"})`
        );
        continue;
      }

      clinicId = data.id;
      result.inserted += 1;
      existing.push({
        id: clinicId,
        nome: place.nome,
        contato: place.contato,
        endereco: place.endereco,
        cidade: place.cidade,
        forum: null,
      });
    }

    if (!clinicId) {
      result.warnings.push(`${place.nome}: sem id para criar categoria do fórum.`);
      continue;
    }

    const forumSynced = await ensureForumCategory(supabase, parents, clinicId, place);

    if (forumSynced) {
      result.forums += 1;
    } else {
      result.warnings.push(
        `${place.nome}: não encontrei categoria pai do fórum para ${place.estado}/${place.tipo}.`
      );
    }
  }

  return result;
}

function buildClinicPayload(place, { update }) {
  const payload = {
    nome: place.nome,
    descricao: place.descricao,
    contato: place.contato,
    site: place.site,
    endereco: place.endereco,
    bairro: place.bairro,
    cidade: place.cidade,
    estado: place.estado,
    lat: place.lat,
    lng: place.lng,
    tipo: place.tipo,
    horarios: place.horarios,
    preco_30_normal: place.preco_30_normal,
    preco_30_forista: place.preco_30_forista,
    preco_60_normal: place.preco_60_normal,
    preco_60_forista: place.preco_60_forista,
  };

  if (!update) {
    payload.plano = place.plano;
    payload.imagens = place.imagens;
  }

  return payload;
}

async function ensureForumCategory(supabase, parents, clinicId, place) {
  const parentId = parents.get(`${place.estado}:${place.tipo}`);

  if (!parentId) {
    return false;
  }

  const slug = `${place.tipo}-${clinicId}-${slugify(place.nome) || "local"}`;
  const { data, error } = await supabase
    .from("forum_categories")
    .upsert(
      {
        nome: place.nome,
        slug,
        descricao: `Discussões e avaliações sobre ${place.nome}`,
        parent_id: parentId,
        clinic_id: clinicId,
        estado: place.estado,
        tipo: place.tipo,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error || !data?.id) {
    return false;
  }

  const { error: updateError } = await supabase
    .from("clinicas")
    .update({ forum: `/forum/categoria/${data.id}` })
    .eq("id", clinicId);

  return !updateError;
}

async function loadExistingClinics(supabase) {
  const { data, error } = await supabase
    .from("clinicas")
    .select("id,nome,contato,endereco,cidade,forum");

  if (error) {
    throw new Error(`erro ao carregar duplicados do Supabase: ${error.message}`);
  }

  return data || [];
}

async function loadForumParents(supabase) {
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id,estado,tipo")
    .not("parent_id", "is", null)
    .is("clinic_id", null)
    .in("estado", KNOWN_STATES)
    .in("tipo", DEFAULT_INCLUDE);

  if (error) {
    throw new Error(`erro ao carregar categorias pai do fórum: ${error.message}`);
  }

  return new Map((data || []).map((parent) => [`${parent.estado}:${parent.tipo}`, parent.id]));
}

function findDuplicate(existing, place) {
  const phone = onlyDigits(place.contato);
  const address = normalizeKey(place.endereco);
  const nameCity = normalizeKey(`${place.nome}:${place.cidade}`);

  return existing.find((clinic) => {
    const existingPhone = onlyDigits(clinic.contato);

    if (phone && existingPhone && phone === existingPhone) {
      return true;
    }

    if (address && normalizeKey(clinic.endereco) === address) {
      return true;
    }

    return nameCity && normalizeKey(`${clinic.nome}:${clinic.cidade}`) === nameCity;
  });
}

function printPreview(places) {
  const byType = countBy(places, "tipo");
  const byState = countBy(places, "estado");

  console.log("\nResumo da coleta:");
  console.log(`- Locais válidos: ${places.length}`);
  console.log(`- Por tipo: ${formatCounts(byType)}`);
  console.log(`- Por estado: ${formatCounts(byState)}`);

  console.log("\nAmostra:");
  for (const place of places.slice(0, 8)) {
    const price = place.preco_60_forista || place.preco_60_normal || "-";
    const rating = place.avaliacaoFonte ? place.avaliacaoFonte.toFixed(2) : "-";
    console.log(
      `- ${place.tipoLabel}: ${place.nome} | ${place.cidade}/${place.estado} | 1h R$ ${price} | nota fonte ${rating}`
    );
  }
}

function parsePrices(services, fallback) {
  const prices = {
    preco_30_normal: null,
    preco_30_forista: null,
    preco_60_normal: null,
    preco_60_forista: null,
  };

  for (const service of services || []) {
    const duration = Number(service.duration_min);

    if (duration !== 30 && duration !== 60) {
      continue;
    }

    if (service.name) {
      continue;
    }

    const normalKey = `preco_${duration}_normal`;
    const foristaKey = `preco_${duration}_forista`;

    if (prices[normalKey] == null) {
      prices[normalKey] = toNumberOrNull(service.price_normal);
    }

    if (prices[foristaKey] == null) {
      prices[foristaKey] = toNumberOrNull(service.price_forista);
    }
  }

  if (prices.preco_30_normal == null && fallback.price30min != null) {
    prices.preco_30_normal = toNumberOrNull(fallback.price30min);
  }

  if (prices.preco_60_normal == null && fallback.price60min != null) {
    prices.preco_60_normal = toNumberOrNull(fallback.price60min);
  }

  return prices;
}

function parseHours(openingHours) {
  const byDay = new Map(
    (openingHours || []).map((item) => [
      Number(item.day_of_week),
      normalizeHourRange(item.open_time, item.close_time),
    ])
  );
  const weekdays = [1, 2, 3, 4, 5]
    .map((day) => byDay.get(day))
    .filter(Boolean);

  return {
    weekday: uniqueRanges(weekdays),
    saturday: byDay.get(6) ? [byDay.get(6)] : [],
    sunday: byDay.get(0) ? [byDay.get(0)] : [],
  };
}

function normalizeHourRange(openTime, closeTime) {
  if (!openTime || !closeTime) {
    return null;
  }

  return {
    open: String(openTime).slice(0, 5),
    close: String(closeTime).slice(0, 5),
  };
}

function uniqueRanges(ranges) {
  const seen = new Set();
  const unique = [];

  for (const range of ranges) {
    const key = `${range.open}-${range.close}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(range);
    }
  }

  return unique;
}

function parseAddressParts(address) {
  const cleanAddress = address.trim();
  const normalized = normalizeText(cleanAddress);
  let estado =
    cleanAddress.match(/\b(SP|RJ|MG|PR|SC|RS)\b/)?.[1] ||
    [...STATE_NAME_TO_CODE.entries()].find(([name]) =>
      normalized.includes(name)
    )?.[1] ||
    "";

  let bairro = "";
  let cidade = "";
  const segments = cleanAddress
    .split(" - ")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const stateCodeSegmentIndex = segments.findIndex((segment) =>
    /\b(SP|RJ|MG|PR|SC|RS)\b/.test(segment)
  );
  const stateNameSegmentIndex = segments.findIndex((segment) => {
    const segmentNormalized = normalizeText(segment);
    return [...STATE_NAME_TO_CODE.keys()].some((name) =>
      segmentNormalized.startsWith(name)
    );
  });
  const stateSegmentIndex =
    stateCodeSegmentIndex >= 0 ? stateCodeSegmentIndex : stateNameSegmentIndex;
  const locationSegment =
    stateSegmentIndex > 0 ? segments[stateSegmentIndex - 1] : segments[1] || "";

  if (locationSegment) {
    const parts = locationSegment
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    bairro = parts[0] || "";
    cidade = parts[parts.length - 1] || "";
  }

  if (!cidade) {
    cidade = estado ? stateCodeToMainCity(estado) : "";
  }

  if (!bairro && segments.length > 1 && stateSegmentIndex > 1) {
    bairro = segments[stateSegmentIndex - 1] || "";
  }

  if (!estado && normalizeText(cidade) === "sao paulo") {
    estado = "SP";
  }

  return {
    bairro,
    cidade,
    estado,
  };
}

function stateCodeToMainCity(estado) {
  return (
    {
      SP: "São Paulo",
      RJ: "Rio de Janeiro",
      MG: "Belo Horizonte",
      PR: "Curitiba",
      SC: "Florianópolis",
      RS: "Porto Alegre",
    }[estado] || ""
  );
}

async function fetchFreshState(url) {
  const html = await fetchText(url);
  const match = html.match(
    /<script id="__FRSH_STATE_[^"]+"[^>]*>([\s\S]*?)<\/script>/
  );

  if (!match?.[1]) {
    throw new Error(`estado Fresh não encontrado em ${url}`);
  }

  return JSON.parse(match[1]);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${url} retornou HTTP ${response.status}`);
  }

  return response.text();
}

async function createSupabaseAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://ptdeanjznvskgzgejdxx.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_0SibZaKPSfpovJj2q5RURA_Szg5b44b";
  const adminEmail =
    process.env.SUPABASE_ADMIN_EMAIL || process.env.PRIVACYLOG_ADMIN_EMAIL;
  const adminPassword =
    process.env.SUPABASE_ADMIN_PASSWORD ||
    process.env.PRIVACYLOG_ADMIN_PASSWORD;

  if (!serviceRoleKey) {
    if (!adminEmail || !adminPassword) {
      throw new Error(
        "defina SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ADMIN_EMAIL/SUPABASE_ADMIN_PASSWORD no ambiente para importar no Supabase."
      );
    }

    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      throw new Error(`falha no login admin do Supabase: ${error.message}`);
    }

    return supabase;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function findFirst(value, predicate, seen = new Set()) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (seen.has(value)) {
    return null;
  }

  seen.add(value);

  if (predicate(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirst(item, predicate, seen);

      if (found) {
        return found;
      }
    }
  } else {
    for (const item of Object.values(value)) {
      const found = findFirst(item, predicate, seen);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

async function writeJson(filePath, data) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (const rawArg of rawArgs) {
    if (!rawArg.startsWith("--")) {
      continue;
    }

    const [key, value] = rawArg.slice(2).split("=");
    parsed[key] = value ?? true;
  }

  return parsed;
}

function parseList(value, fallback) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseInteger(value) {
  if (value === true || value == null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumberOrNull(value) {
  if (value == null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toNullableString(value) {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function onlyDigits(value) {
  return String(value || "").replace(/\D+/g, "");
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeKey(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function countBy(items, key) {
  return items.reduce((accumulator, item) => {
    const value = item[key] || "sem-info";
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
