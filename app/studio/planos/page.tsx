import Link from "next/link";
import StudioPlanCard from "@/components/studio/StudioPlanCard";
import { pageMetadata } from "@/lib/seo";
import { studioExtras, studioPlans } from "@/lib/studio/data";

export const metadata = pageMetadata({
  title: "Planos PrivacyLog",
  description:
    "Planos Essencial e Black: página premium para a sua casa, com identidade própria, mapa e destaque na home do PrivacyLog.",
  product: "studio",
  path: "/planos",
});

export default function StudioPlansPage() {
  return (
    <main className="studio-shell studio-secondary-page studio-plans-page">
      <section className="studio-page-hero">
        <div className="studio-container">
          <p className="studio-kicker">Setup grátis por tempo limitado</p>
          <h1>Escolha como a sua casa vai aparecer no PrivacyLog</h1>
          <p>
            Dois caminhos simples: uma vitrine premium com identidade própria
            para organizar a sua presença, ou o plano Black com destaque na
            home, presença no mapa, suporte prioritário e domínio próprio
            quando a casa ainda não tiver.
          </p>
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-container">
          <div className="studio-plan-grid">
            {studioPlans.map((plan) => (
              <StudioPlanCard key={plan.slug} plan={plan} />
            ))}
          </div>
          <div className="studio-extra-box">
            <h2>O que permanece em todos os planos</h2>
            <ul>
              {studioExtras.map((extra) => (
                <li key={extra}>{extra}</li>
              ))}
            </ul>
            <p>
              Nesta fase, o setup é gratuito. A proposta é simples: sua casa
              ganha uma apresentação premium, organizada e pronta para gerar
              confiança antes da conversa no WhatsApp.
            </p>
            <Link href="/studio/solicitar-site" className="studio-button primary">
              Quero elevar minha marca
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
