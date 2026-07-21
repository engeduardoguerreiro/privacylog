import { pageMetadata } from "@/lib/seo";
import LeadForm from "@/components/studio/LeadForm";

export const metadata = pageMetadata({
  title: "Quero uma Vitrine Premium | PrivacyLog Studio",
  description:
    "Solicite uma vitrine premium para sua casa vender com mais luxo, desejo e presenca no ecossistema PrivacyLog.",
  product: "studio",
  path: "/solicitar-site",
});

export default async function StudioRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; plano?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="studio-shell">
      <section className="studio-page-hero studio-request-hero">
        <div className="studio-container studio-two-column">
          <div className="studio-request-copy">
            <p className="studio-kicker">Entrar para o Studio</p>
            <h1>Sua casa pode parecer mais cara ainda hoje</h1>
            <p>
              Envie seus dados e nossa equipe chama voce para posicionar sua
              marca com mais luxo, privacidade e poder de conversao.
            </p>
          </div>
          <LeadForm status={params.status} defaultPlan={params.plano || "premium"} />
        </div>
      </section>
    </main>
  );
}
