import Footer from "@/components/layout/Footer";
import ProductHeader from "@/components/layout/ProductHeader";
import LoungeCard, { type LoungeLocation } from "@/components/lounge/LoungeCard";
import LoungeFilters from "@/components/lounge/LoungeFilters";
import { supabase } from "@/lib/supabase";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  product: "lounge",
  path: "/clinicas",
  title: "Clínicas e Locais | PrivacyLog Lounge",
  description:
    "Listagem premium de clínicas, casas, lounges, massagens e estabelecimentos adultos no Brasil.",
});

export default async function LoungeClinicasPage() {
  const { data } = await supabase
    .from("clinicas")
    .select("id,nome,bairro,cidade,estado,tipo,plano,contato,imagens")
    .order("plano", { ascending: false })
    .order("nome", { ascending: true });

  const locations = (data || []) as LoungeLocation[];

  return (
    <main className="lounge-home-shell lounge-directory-page">
      <ProductHeader product="lounge" />
      <section className="site-container py-10 lounge-directory-hero">
        <p className="premium-kicker">Diretório</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Clínicas e locais cadastrados
        </h1>
        <p className="mt-4 max-w-2xl text-[#b8b8c8]">
          Grid premium com foto, cidade, bairro, categoria e acesso rápido ao
          WhatsApp quando disponível.
        </p>
      </section>

      <section className="site-container lounge-directory-content">
        <LoungeFilters />
        <div className="lounge-grid">
          {locations.map((location) => (
            <LoungeCard key={location.id} location={location} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
