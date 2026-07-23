import Link from "next/link";
import Footer from "@/components/layout/Footer";
import ProductHeader from "@/components/layout/ProductHeader";
import { pageMetadata } from "@/lib/seo";

const categories = [
  ["clinica", "Clínicas", "Locais com atendimento estruturado e página individual."],
  ["massagem", "Massagens", "Casas e espaços dedicados a experiências de massagem."],
  ["boate", "Boates", "Casas noturnas e estabelecimentos adultos."],
  ["prive", "Privês", "Locais privados e experiências reservadas."],
  ["freelancer", "Acompanhantes Freelancers", "Categoria preparada para perfis futuros."],
  ["swing", "Casas de Swing", "Categoria preparada para clubes e casas parceiras."],
];

export const metadata = pageMetadata({
  product: "lounge",
  path: "/categorias",
  title: "Categorias | PrivacyLog Lounge",
  description:
    "Categorias do diretório PrivacyLog Lounge para clínicas, massagens, boates, privês e parceiros adultos.",
});

export default function LoungeCategoriasPage() {
  return (
    <main className="premium-shell">
      <ProductHeader product="lounge" />
      <section className="site-container py-10">
        <p className="premium-kicker">Categorias</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Organização do Lounge
        </h1>
        <p className="mt-4 max-w-2xl text-[#b8b8c8]">
          A estrutura está preparada para crescer por cidade, categoria,
          destaque premium e verificação.
        </p>
      </section>
      <section className="site-container lounge-grid">
        {categories.map(([slug, title, description]) => (
          <Link key={slug} href="/lounge/clinicas" className="privacy-card p-6">
            <span className="privacy-badge badge-premium">{slug}</span>
            <h2 className="mt-4 text-2xl font-black text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#b8b8c8]">
              {description}
            </p>
          </Link>
        ))}
      </section>
      <Footer />
    </main>
  );
}
