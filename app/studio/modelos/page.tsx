import TemplatePreview from "@/components/studio/TemplatePreview";
import { pageMetadata } from "@/lib/seo";
import { studioTemplates } from "@/lib/studio/data";

export const metadata = pageMetadata({
  title: "Modelos de Sites PrivacyLog Studio",
  description: "Assinaturas visuais premium para casas adultas que querem parecer mais luxuosas, discretas e desejadas.",
  product: "studio",
  path: "/modelos",
});

export default function StudioTemplatesPage() {
  return (
    <main className="studio-shell">
      <section className="studio-page-hero">
        <div className="studio-container">
          <p className="studio-kicker">Assinaturas visuais</p>
          <h1>Escolha a atmosfera que sua marca vai provocar</h1>
          <p>
            Do bordo discreto ao dourado Black, cada direcao visual foi criada
            para fazer sua casa parecer mais cara, mais segura e mais memoravel.
          </p>
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-container">
          <div className="studio-template-grid">
            {studioTemplates.map((template) => (
              <TemplatePreview key={template.name} {...template} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
