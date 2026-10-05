import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ClinicaView from "@/app/clinica/[id]/ClinicaView";
import {
  getClinicDescription,
  getClinicImages,
  type Clinic,
} from "@/app/clinica/[id]/data";
import { pageMetadata } from "@/lib/seo";
import { getMainSiteUrl, getProductBaseUrl } from "@/lib/subdomain";
import { supabase } from "@/lib/supabase";

// HTML gerado no servidor e revalidado a cada 5 min
export const revalidate = 300;

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Busca o local no servidor (cliente anon, respeita RLS). O cache do React
 * faz generateMetadata e a pagina dividirem a mesma consulta.
 * Retorna null para id invalido ou inexistente; erro do banco sobe para nao
 * virar 404 em cache.
 */
const getClinic = cache(async (id: string): Promise<Clinic | null> => {
  const numericId = Number(id);

  if (!id || !Number.isSafeInteger(numericId) || numericId <= 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("clinicas")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar clínica:", error);
    throw new Error("Falha ao buscar o local");
  }

  return (data as Clinic | null) ?? null;
});

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// JSON-LD LocalBusiness com os dados reais do local
function buildJsonLd(clinic: Clinic) {
  const url = `${getProductBaseUrl("main")}/clinicas/${clinic.id}`;
  const siteUrl = getMainSiteUrl();
  const images = getClinicImages(clinic).map((image) =>
    image.startsWith("/") ? `${siteUrl}${image}` : image
  );
  const lat = toNumber(clinic.lat);
  const lng = toNumber(clinic.lng);
  const telephone = String(clinic.contato || "").trim();
  // Bairro entra junto do endereco (schema.org nao tem campo proprio)
  const endereco = String(clinic.endereco || "").trim();
  const bairro = String(clinic.bairro || "").trim();
  const streetAddress =
    bairro && !endereco.includes(bairro)
      ? [endereco, bairro].filter(Boolean).join(", ")
      : endereco;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url,
    name: clinic.nome,
    url,
    description: getClinicDescription(clinic),
    image: images,
    address: {
      "@type": "PostalAddress",
      ...(streetAddress ? { streetAddress } : {}),
      ...(clinic.cidade ? { addressLocality: clinic.cidade } : {}),
      ...(clinic.estado ? { addressRegion: clinic.estado } : {}),
      addressCountry: "BR",
    },
    ...(telephone ? { telephone } : {}),
    ...(clinic.site ? { sameAs: [clinic.site] } : {}),
    ...(lat !== null && lng !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }
      : {}),
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getClinic(id);

  if (!data) {
    notFound();
  }

  return pageMetadata({
    title: `${data.nome}: massagem em ${data.bairro || data.cidade || "Brasil"} | PrivacyLog`,
    description:
      getClinicDescription(data),
    product: "main",
    path: `/clinicas/${data.id}`,
  });
}

export default async function LoungeClinicaPage({ params }: PageProps) {
  const { id } = await params;
  const clinic = await getClinic(id);

  if (!clinic) {
    notFound();
  }

  // Escapa "<" para o JSON nao fechar a tag script
  const jsonLd = JSON.stringify(buildJsonLd(clinic)).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {/* Ja vai com a descricao final: o texto provisorio do robo nem chega ao navegador. */}
      <ClinicaView clinic={{ ...clinic, descricao: getClinicDescription(clinic) }} />
    </>
  );
}
