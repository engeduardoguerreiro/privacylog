import Footer from "@/components/layout/Footer";
import ProductHeader from "@/components/layout/ProductHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  product: "lounge",
  path: "/anunciar",
  title: "Anunciar | PrivacyLog Lounge",
  description:
    "Divulgue sua clínica, casa ou estabelecimento adulto no PrivacyLog Lounge.",
});

export default function LoungeAnunciarPage() {
  return (
    <main className="premium-shell">
      <ProductHeader product="lounge" />
      <section className="site-container py-10">
        <p className="premium-kicker">Anunciantes</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Divulgue seu estabelecimento
        </h1>
        <p className="mt-4 max-w-2xl text-[#b8b8c8]">
          Apareça no mapa, receba contatos diretos e destaque sua marca em uma
          vitrine premium.
        </p>
      </section>

      <section className="site-container grid gap-6 lg:grid-cols-[1fr_460px]">
        <div className="lounge-seller-grid">
          {[
            "Página individual do estabelecimento",
            "Destaque por cidade e categoria",
            "Botão WhatsApp e site",
            "Selo premium e prioridade visual",
          ].map((item) => (
            <article key={item} className="privacy-card p-6">
              <h2 className="text-xl font-black text-white">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-[#b8b8c8]">
                Estrutura pensada para tráfego qualificado e descoberta
                discreta.
              </p>
            </article>
          ))}
        </div>

        <form
          action="mailto:contato@privacylog.com.br"
          method="post"
          encType="text/plain"
          className="forum-form-card p-6"
        >
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-[#b8b8c8]">
              Nome do estabelecimento
            </span>
            <input name="estabelecimento" className="forum-input" required />
          </label>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-[#b8b8c8]">
              Cidade
            </span>
            <input name="cidade" className="forum-input" required />
          </label>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-[#b8b8c8]">
              WhatsApp
            </span>
            <input name="whatsapp" className="forum-input" required />
          </label>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-[#b8b8c8]">
              Tipo de estabelecimento
            </span>
            <input name="tipo" className="forum-input" />
          </label>
          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-bold text-[#b8b8c8]">
              Mensagem
            </span>
            <textarea name="mensagem" className="forum-textarea" />
          </label>
          <button type="submit" className="primary-button w-full">
            Quero anunciar
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
