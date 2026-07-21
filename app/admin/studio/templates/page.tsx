import TemplatePreview from "@/components/studio/TemplatePreview";
import { studioTemplates } from "@/lib/studio/data";

export default function AdminStudioTemplatesPage() {
  return (
    <main className="studio-shell p-8">
      <section className="studio-container">
        <p className="studio-kicker">Admin Studio</p>
        <h1>Templates</h1>
        <div className="studio-template-grid">
          {studioTemplates.map((template) => (
            <TemplatePreview key={template.name} {...template} />
          ))}
        </div>
      </section>
    </main>
  );
}
