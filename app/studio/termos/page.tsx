import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Termos de Uso Studio",
  description: "Termos de uso do PrivacyLog Studio.",
  product: "studio",
  path: "/termos",
});

export default function StudioTermsPage() {
  return <Legal title="Termos de uso" />;
}

function Legal({ title }: { title: string }) {
  return (
    <main className="studio-shell studio-secondary-page">
      <section className="studio-page-hero">
        <div className="studio-container studio-legal">
          <p className="studio-kicker">Compliance</p>
          <h1>{title}</h1>
          <p>
            O PrivacyLog Studio atende exclusivamente estabelecimentos e
            responsáveis maiores de 18 anos. É proibido publicar ou solicitar
            conteúdo ilegal, conteúdo envolvendo menores, exposição sem
            consentimento, dados pessoais de terceiros ou qualquer material sem
            autorização expressa.
          </p>
          <p>
            A clínica declara ser responsável por direitos de imagem,
            autorizações, veracidade das informações, atendimento dentro da lei e
            moderação de sua própria equipe. O PrivacyLog pode suspender páginas
            ou remover conteúdo quando houver risco jurídico, denúncia ou
            violação das regras.
          </p>
        </div>
      </section>
    </main>
  );
}
