import Footer from "@/components/layout/Footer";
import ProductHeader from "@/components/layout/ProductHeader";
import { notFound } from "next/navigation";
import LoungeCard, { type LoungeLocation } from "@/components/lounge/LoungeCard";
import { getLoungeCityBySlug } from "@/lib/lounge/cities";
import { pageMetadata } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

// Lista muda pouco: regenera no maximo a cada 10 minutos.
export const revalidate = 600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const city = await getLoungeCityBySlug(slug);
  const name = city?.name || "Cidade";

  return pageMetadata({
    title: `Massagem sensual em ${name} | PrivacyLog`,
    description: `Massagem sensual, tântrica e relaxante em ${name}: ${city?.count || "as"} casas, clínicas e privês com endereço, fotos e contato direto no WhatsApp.`,
    product: "lounge",
    path: `/cidade/${slug}`,
  });
}

export default async function LoungeCidadePage({ params }: PageProps) {
  const { slug } = await params;
  const cityInfo = await getLoungeCityBySlug(slug);

  if (!cityInfo) {
    notFound();
  }

  const city = cityInfo.name;
  const { data } = await supabase
    .from("clinicas")
    .select("id,nome,bairro,cidade,estado,tipo,plano,contato,imagens")
    .eq("cidade", city)
    .order("plano", { ascending: false })
    .order("nome", { ascending: true });

  return (
    <main className="premium-shell">
      <ProductHeader product="lounge" />
      <section className="site-container py-10">
        <p className="premium-kicker">Cidade</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Massagem sensual em {city}
        </h1>
        <p className="mt-4 max-w-2xl text-[#b8b8c8]">
          Casas, clínicas e privês para massagem sensual, tântrica e relaxante
          em {city}. Escolha o seu e chame direto no WhatsApp.
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
