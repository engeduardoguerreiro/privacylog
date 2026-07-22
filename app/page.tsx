import Link from "next/link";
import {
  ArrowRight,
  LayoutTemplate,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import { studioClinics } from "@/lib/studio/data";
import { pageMetadata } from "@/lib/seo";
import SiteHeader from "./_home/SiteHeader";
import FeaturedModels, { type FeaturedModel } from "./_home/FeaturedModels";
import ClinicsCarousel, { type CarouselClinic } from "./_home/ClinicsCarousel";
import Reveal from "./_home/Reveal";
import styles from "./home.module.css";

export const metadata = pageMetadata({
  title: "PrivacyLog | Casas de massagem, clínicas e privês",
  description:
    "O guia premium de casas de massagem, clínicas e privês com página própria, modelos verificadas e presença no mapa. Descubra as casas parceiras.",
});

const services = [
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

const totalModels = studioClinics.reduce(
  (count, clinic) =>
    count + clinic.professionals.filter((p) => p.isActive).length,
  0
);

// Uma modelo por casa cadastrada: a que estiver ativa no dia
// (prioriza "disponível agora", depois destaque, senão a primeira ativa).
const featuredModels: FeaturedModel[] = studioClinics
  .map((clinic) => {
    const actives = clinic.professionals.filter((p) => p.isActive);
    if (!actives.length) return null;

    const availableToday = actives.filter((p) => p.isAvailableToday);
    const pool = availableToday.length ? availableToday : actives;
    const professional =
      pool.find((p) => p.status === "available_now") ||
      pool.find((p) => p.isFeatured) ||
      pool[0];

    const model: FeaturedModel = {
      stageName: professional.stageName,
      slug: professional.slug,
      mainPhotoUrl: professional.mainPhotoUrl,
      status: professional.status,
      clinicName: clinic.name,
      clinicSlug: clinic.slug,
    };

    return model;
  })
  .filter((model): model is FeaturedModel => model !== null);

const planRank: Record<string, number> = {
  black: 3,
  premium: 2,
  essential: 1,
};

const carouselClinics: CarouselClinic[] = studioClinics
  .filter((clinic) => planRank[clinic.plan] !== undefined)
  .sort((a, b) => (planRank[b.plan] || 0) - (planRank[a.plan] || 0))
  .map((clinic) => ({
    name: clinic.name,
    slug: clinic.slug,
    city: clinic.city,
    neighborhood: clinic.neighborhood,
    address: clinic.address,
    mainImageUrl: clinic.mainImageUrl,
    plan: clinic.plan,
  }));

export default function Home() {
  const citiesCount = new Set(studioClinics.map((clinic) => clinic.city)).size;

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main>
        <section className={styles.hero}>
          <div className={styles.container}>
            <span className={styles.kicker}>Casas de massagem, clínicas e privês</span>
            <h1 className={styles.heroTitle}>
              As melhores casas, com fotos reais e <em>atualizadas</em>.
            </h1>
            <p className={styles.heroSub}>
              O PrivacyLog reúne clínicas, casas e privês selecionados em um só
              lugar: página própria premium, modelos verificadas e presença no
              mapa. Discrição, organização e confiança.
            </p>
            <div className={styles.heroActions}>
              <Link href="#clinicas" className={`${styles.btn} ${styles.btnPrimary}`}>
                Ver as casas
                <ArrowRight size={18} />
              </Link>
              <Link href="/lounge/mapa" className={`${styles.btn} ${styles.btnGhost}`}>
                Ver o mapa
              </Link>
            </div>

            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <strong>{totalModels}</strong> modelos
              </span>
              <span className={styles.heroStat}>
                <strong>{studioClinics.length}</strong> casas
              </span>
              <span className={styles.heroStat}>
                <strong>{citiesCount}</strong> cidades
              </span>
              <span className={styles.liveDot}>
                <i aria-hidden="true" /> atualizado agora
              </span>
            </div>
          </div>
        </section>

        <section id="modelos" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <span className={styles.kicker}>Em destaque</span>
              <h2 className={styles.sectionTitle}>Modelos em destaque</h2>
              <p className={styles.sectionText}>
                Profissionais das casas parceiras. Arraste para explorar e clique
                para conhecer a casa.
              </p>
            </Reveal>

            <Reveal>
              <FeaturedModels models={featuredModels} />
            </Reveal>
          </div>
        </section>

        <section id="clinicas" className={styles.section}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <span className={styles.kicker}>Casas parceiras</span>
              <h2 className={styles.sectionTitle}>Clínicas e privês</h2>
              <p className={styles.sectionText}>
                Nossas casas assinantes, das mais completas às essenciais.
                Arraste e clique para conhecer a página de cada uma.
              </p>
            </Reveal>

            <Reveal>
              <ClinicsCarousel clinics={carouselClinics} />
            </Reveal>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.container}>
            <Reveal>
              <div className={styles.mapBand}>
                <div className={styles.mapBandText}>
                  <span className={styles.kicker}>Radar de localização</span>
                  <h2>Veja as casas no mapa</h2>
                  <p>
                    Encontre a opção mais próxima por cidade e bairro, com rota
                    direta e contato reservado.
                  </p>
                </div>
                <Link href="/lounge/mapa" className={`${styles.btn} ${styles.btnPrimary}`}>
                  <MapPin size={18} />
                  Abrir o mapa
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <span className={styles.kicker}>Para a sua casa</span>
              <h2 className={styles.sectionTitle}>
                Tudo que a sua casa precisa para ser encontrada e escolhida.
              </h2>
              <p className={styles.sectionText}>
                Uma estrutura pensada para o segmento, sem parecer amadora nem
                exposta. Você cuida da casa; a plataforma cuida da presença.
              </p>
            </Reveal>

            <div className={styles.grid}>
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Reveal key={service.title} delay={index * 90}>
                    <article className={styles.card}>
                      <span className={styles.cardIcon}>
                        <Icon size={22} />
                      </span>
                      <h3 className={styles.cardTitle}>{service.title}</h3>
                      <p className={styles.cardText}>{service.text}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.container}>
          <Reveal>
            <div className={styles.ctaBand}>
              <h2 className={styles.ctaTitle}>
                Anuncie a sua casa no <span>PrivacyLog</span>.
              </h2>
              <p className={styles.ctaText}>
                Escolha um plano, crie sua página premium e comece a receber
                contatos qualificados. Onboarding simples, sem taxa de setup.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/studio/cadastro" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Começar agora
                  <ArrowRight size={18} />
                </Link>
                <Link href="/studio/planos" className={`${styles.btn} ${styles.btnGhost}`}>
                  Ver planos
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <span className={styles.footerBrand}>PrivacyLog © 2026</span>
            <nav className={styles.footerLinks} aria-label="Rodapé">
              <Link href="/studio">Anunciar</Link>
              <Link href="/lounge/mapa">Mapa</Link>
              <Link href="/login">Entrar</Link>
              <a href="mailto:contato@privacylog.com.br">Contato</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
