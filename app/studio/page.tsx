import Link from "next/link";
import {
  ArrowRight,
  Check,
  LayoutTemplate,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import { studioPlans } from "@/lib/studio/data";
import { pageMetadata } from "@/lib/seo";
import styles from "./studio.module.css";

export const metadata = pageMetadata({
  title: "Anuncie sua casa",
  description:
    "Coloque sua clínica, casa ou privê no PrivacyLog: página própria premium, painel de modelos e serviços, contato no WhatsApp e presença no mapa.",
  product: "studio",
});

const benefits = [
  {
    icon: LayoutTemplate,
    title: "Página premium própria",
    text: "Uma landing sofisticada e discreta da sua casa, pronta para converter quem clica em 'saiba mais'.",
  },
  {
    icon: Users,
    title: "Painel de modelos e serviços",
    text: "Cadastre e atualize profissionais, fotos, horários e serviços quando quiser, sem depender de ninguém.",
  },
  {
    icon: MessageCircle,
    title: "Conversão no WhatsApp",
    text: "Botão direto para o cliente falar com a casa, com registro de cliques para você medir resultado.",
  },
  {
    icon: MapPin,
    title: "Presença no mapa",
    text: "Sua casa aparece no diretório e no mapa do PrivacyLog, ganhando descoberta além dos seus canais.",
  },
];

const steps = [
  {
    title: "Escolha o plano",
    text: "Comece pelo Essencial ou vá direto ao Black, com divulgação no mapa e destaque na home.",
  },
  {
    title: "Envie os dados da casa",
    text: "Nome, endereço, horários, fotos do ambiente e o WhatsApp que recebe os contatos.",
  },
  {
    title: "Cadastre suas modelos",
    text: "No painel, você adiciona as profissionais, fotos e a disponibilidade do dia.",
  },
  {
    title: "Comece a receber contatos",
    text: "Sua página entra no ar e passa a aparecer para quem procura casas na sua região.",
  },
];

export default function StudioPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span className={styles.kicker}>Para a sua casa</span>
          <h1 className={styles.title}>
            Anuncie sua casa e seja <em>encontrada</em>.
          </h1>
          <p className={styles.lead}>
            Página própria premium, painel para gerir modelos e serviços,
            contato direto no WhatsApp e presença no mapa do PrivacyLog. Você
            cuida da casa; a plataforma cuida da presença.
          </p>
          <div className={styles.actions}>
            <Link href="/studio/cadastro" className={`${styles.btn} ${styles.btnPrimary}`}>
              Quero anunciar
              <ArrowRight size={18} />
            </Link>
            <Link href="#planos" className={`${styles.btn} ${styles.btnGhost}`}>
              Ver planos
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>O que você recebe</span>
            <h2 className={styles.sectionTitle}>
              Tudo que a sua casa precisa para ser encontrada e escolhida.
            </h2>
            <p className={styles.sectionText}>
              Uma estrutura pensada para o segmento, sem parecer amadora nem
              exposta.
            </p>
          </div>

          <div className={styles.grid}>
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className={styles.card}>
                  <span className={styles.cardIcon}>
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.cardTitle}>{benefit.title}</h3>
                  <p className={styles.cardText}>{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="planos" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Planos</span>
            <h2 className={styles.sectionTitle}>Escolha como quer aparecer.</h2>
            <p className={styles.sectionText}>
              Sem taxa de setup. Você pode começar simples e evoluir depois.
            </p>
          </div>

          <div className={styles.plans}>
            {studioPlans.map((plan) => {
              const featured = plan.slug === "black";

              return (
                <article
                  key={plan.slug}
                  className={`${styles.plan} ${featured ? styles.planFeatured : ""}`}
                >
                  {plan.highlight ? (
                    <span className={styles.planBadge}>{plan.highlight}</span>
                  ) : null}

                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planPrice}>{plan.price}</p>
                  <p className={styles.planAudience}>{plan.audience}</p>

                  <ul className={styles.planFeatures}>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={17} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/studio/cadastro"
                    className={`${styles.btn} ${
                      featured ? styles.btnPrimary : styles.btnGhost
                    } ${styles.planCta}`}
                  >
                    Começar com {plan.name}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Como funciona</span>
            <h2 className={styles.sectionTitle}>Do cadastro ao primeiro contato.</h2>
          </div>

          <div className={styles.steps}>
            {steps.map((step, index) => (
              <article key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.ctaBand}>
          <h2 className={styles.ctaTitle}>
            Pronta para colocar sua casa no <span>PrivacyLog</span>?
          </h2>
          <p className={styles.ctaText}>
            Faça o cadastro e nossa equipe coloca sua página no ar. Onboarding
            simples, sem taxa de setup.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/studio/cadastro" className={`${styles.btn} ${styles.btnPrimary}`}>
              Começar agora
              <ArrowRight size={18} />
            </Link>
            <Link href="/studio/contato" className={`${styles.btn} ${styles.btnGhost}`}>
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
