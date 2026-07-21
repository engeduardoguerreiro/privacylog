import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed
      .slice(index + 1)
      .replace(/^['"]|['"]$/g, "");
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ptdeanjznvskgzgejdxx.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to seed locations.");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const legacySlugByBaseUf = new Map([
  ["sao-paulo-sp", "sao-paulo"],
  ["rio-de-janeiro-rj", "rio-de-janeiro"],
  ["belo-horizonte-mg", "belo-horizonte"],
  ["curitiba-pr", "curitiba"],
  ["florianopolis-sc", "florianopolis"],
  ["porto-alegre-rs", "porto-alegre"],
]);

const neighborhoods = {
  "sao-paulo": [
    "Aclimação",
    "Bela Vista",
    "Brooklin",
    "Butantã",
    "Campo Belo",
    "Centro",
    "Consolação",
    "Itaim Bibi",
    "Indianópolis",
    "Jardim Paulista",
    "Jardins",
    "Moema",
    "Morumbi",
    "Pinheiros",
    "Santo Amaro",
    "Tatuapé",
    "Vila Mariana",
    "Vila Olímpia",
  ],
  "rio-de-janeiro": [
    "Barra da Tijuca",
    "Botafogo",
    "Centro",
    "Copacabana",
    "Flamengo",
    "Ipanema",
    "Leblon",
    "Recreio dos Bandeirantes",
    "Tijuca",
  ],
  "belo-horizonte": ["Barro Preto", "Centro", "Funcionários", "Lourdes", "Savassi", "Sion"],
  curitiba: ["Água Verde", "Batel", "Centro", "Champagnat", "Juvevê"],
  florianopolis: ["Centro", "Jurerê", "Lagoa da Conceição", "Trindade"],
  "porto-alegre": ["Centro Histórico", "Cidade Baixa", "Moinhos de Vento", "Petrópolis"],
  "brasilia-df": ["Asa Norte", "Asa Sul", "Lago Sul", "Sudoeste"],
  "salvador-ba": ["Barra", "Caminho das Árvores", "Pituba", "Rio Vermelho"],
  "fortaleza-ce": ["Aldeota", "Centro", "Meireles", "Praia de Iracema"],
  "recife-pe": ["Boa Viagem", "Casa Forte", "Centro", "Pina"],
  "goiania-go": ["Bueno", "Centro", "Marista", "Oeste"],
  "campinas-sp": ["Cambuí", "Centro", "Taquaral", "Vila Itapura"],
  "santos-sp": ["Boqueirão", "Centro", "Embaré", "Gonzaga"],
};

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios");
if (!response.ok) {
  throw new Error(`IBGE request failed with HTTP ${response.status}`);
}

const municipalities = await response.json();
const cityRows = municipalities
  .map((city) => {
    const uf = city.microrregiao?.mesorregiao?.UF?.sigla || "";
    const stateName = city.microrregiao?.mesorregiao?.UF?.nome || null;
    const baseUfSlug = `${slugify(city.nome)}-${uf.toLowerCase()}`;
    const slug = legacySlugByBaseUf.get(baseUfSlug) || baseUfSlug;

    return {
      name: city.nome,
      state: uf,
      state_name: stateName,
      slug,
      ibge_code: String(city.id),
    };
  })
  .sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name, "pt-BR"));

for (let index = 0; index < cityRows.length; index += 500) {
  const { error } = await supabase
    .from("cities")
    .upsert(cityRows.slice(index, index + 500), { onConflict: "slug" });
  if (error) throw error;
}

const { data: savedCities, error: cityError } = await supabase
  .from("cities")
  .select("id, slug")
  .in("slug", Object.keys(neighborhoods));
if (cityError) throw cityError;

const neighborhoodRows = [];
for (const city of savedCities || []) {
  for (const name of neighborhoods[city.slug] || []) {
    neighborhoodRows.push({
      city_id: city.id,
      name,
      slug: slugify(name),
    });
  }
}

for (let index = 0; index < neighborhoodRows.length; index += 500) {
  const { error } = await supabase
    .from("city_neighborhoods")
    .upsert(neighborhoodRows.slice(index, index + 500), {
      onConflict: "city_id,slug",
      ignoreDuplicates: true,
    });
  if (error) throw error;
}

const [{ count: citiesCount }, { count: neighborhoodsCount }] = await Promise.all([
  supabase.from("cities").select("id", { count: "exact", head: true }),
  supabase.from("city_neighborhoods").select("id", { count: "exact", head: true }),
]);

console.log(
  JSON.stringify(
    {
      cities: citiesCount,
      neighborhoods: neighborhoodsCount,
    },
    null,
    2
  )
);
