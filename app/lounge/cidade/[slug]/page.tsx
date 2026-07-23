import Footer from "@/components/layout/Footer";
import ProductHeader from "@/components/layout/ProductHeader";
import LoungeCard, { type LoungeLocation } from "@/components/lounge/LoungeCard";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const city = titleFromSlug(slug);

  return {
    title: `${city} | PrivacyLog Lounge`,
    description: `Locais cadastrados no PrivacyLog Lounge em ${city}.`,
  };
}

export default async function LoungeCidadePage({ params }: PageProps) {
  const { slug } = await params;
  const city = titleFromSlug(slug);
  const { data } = await supabase
    .from("clinicas")
    .select("id,nome,bairro,cidade,estado,tipo,plano,contato,imagens")
    .ilike("cidade", city)
    .order("plano", { ascending: false })
    .order("nome", { ascending: true });

  return (
    <main className="premium-shell">
      <ProductHeader product="lounge" />
      <section className="site-container py-10">
        <p className="premium-kicker">Cidade</p>
        <h1 className="mt-3 text-4xl font-black text-white">{city}</h1>
        <p className="mt-4 max-w-2xl text-[#b8b8c8]">
          Locais e destaques cadastrados nesta cidade.
        </p>
      </section>
      <section className="site-container lounge-grid">
        {((data || []) as LoungeLocation[]).map((location) => (
          <LoungeCard key={location.id} location={location} />
        ))}
      </section>
      <Footer />
    </main>
  );
}

function titleFromSlug(slug: string) {
  const knownCities: Record<string, string> = {
    "sao-paulo": "São Paulo",
    "rio-de-janeiro": "Rio de Janeiro",
    "belo-horizonte": "Belo Horizonte",
    curitiba: "Curitiba",
    florianopolis: "Florianópolis",
    "porto-alegre": "Porto Alegre",
  };

  if (knownCities[slug]) {
    return knownCities[slug];
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
