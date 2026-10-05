import { notFound } from "next/navigation";
import { getLoungeCities } from "@/lib/lounge/cities";
import { pageMetadata } from "@/lib/seo";
import Directory from "../../Directory";
import { getDirectoryLocals, getPartnerClinics } from "../../data";

// Lista muda pouco: regenera no maximo a cada 10 minutos.
export const revalidate = 600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getCity(slug: string) {
  const cities = await getLoungeCities();
  return { cities, city: cities.find((item) => item.slug === slug) || null };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { city } = await getCity(slug);
  const name = city?.name || "Cidade";

  return pageMetadata({
    title: `Massagem sensual em ${name} | PrivacyLog`,
    description: `Massagem sensual, tântrica e relaxante em ${name}: ${city?.count || "as"} casas, clínicas e privês com endereço, fotos e contato direto no WhatsApp.`,
    path: `/clinicas/cidade/${slug}`,
  });
}

export default async function ClinicasCidadePage({ params }: PageProps) {
  const { slug } = await params;
  const { cities, city } = await getCity(slug);

  if (!city) {
    notFound();
  }

  const [partners, locals] = await Promise.all([
    getPartnerClinics(slug),
    getDirectoryLocals(city.name),
  ]);

  return (
    <Directory
      kicker="Cidade"
      title={`Massagem sensual em ${city.name}`}
      lead={`Casas, clínicas e privês para massagem sensual, tântrica e relaxante em ${city.name}. Escolha a sua e chame direto no WhatsApp.`}
      cities={cities}
      activeCitySlug={slug}
      partners={partners}
      locals={locals}
    />
  );
}
