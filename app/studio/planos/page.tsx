import Link from "next/link";
import StudioPlanCard from "@/components/studio/StudioPlanCard";
import { pageMetadata } from "@/lib/seo";
import { studioExtras, studioPlans } from "@/lib/studio/data";

export const metadata = pageMetadata({
  title: "Planos PrivacyLog Studio",
  description:
    "Planos Essencial e Black para casas adultas venderem com mais luxo, autoridade e presença dentro do ecossistema PrivacyLog.",
  product: "studio",
  path: "/planos",
});

export default function StudioPlansPage() {
  return (
    <main className="studio-shell studio-secondary-page studio-plans-page">
      <section className="studio-page-hero">
        <div className="studio-container">
          <p className="studio-kicker">Setup grátis por tempo limitado</p>
          <h1>Escolha como sua marca vai aparecer no PrivacyLog Studio</h1>
          <p>
            Dois caminhos simples: uma vitrine premium para organizar sua
            presença ou um plano Black com divulgação no Lounge e no Forum,
            suporte 24 horas e domínio próprio quando a casa ainda não tiver.
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
