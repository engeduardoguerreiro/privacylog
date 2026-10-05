import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Camera, MapPin, ShieldCheck } from "lucide-react";
import { getApprovedStudioClinics } from "@/lib/studio/db";
import { pageMetadata } from "@/lib/seo";
import SiteHeader from "./_home/SiteHeader";
import SiteFooter from "./_home/SiteFooter";
import FeaturedModels, { type FeaturedModel } from "./_home/FeaturedModels";
import ClinicsCarousel, { type CarouselClinic } from "./_home/ClinicsCarousel";
import type { StudioClinic } from "@/lib/studio/types";
import Reveal from "./_home/Reveal";
import LiveUpdatedAt from "./_home/LiveUpdatedAt";
import styles from "./home.module.css";

export const metadata = pageMetadata({
  title: "Massagem sensual, tântrica e relaxante | PrivacyLog",
  description:
    "Massagem sensual, tântrica e relaxante nas melhores casas e privês: massagistas verificadas, fotos reais e disponibilidade do dia. Chame no WhatsApp com discrição.",
});

// ISR: a home e cacheada e regenerada a cada 60s (em vez de consultar o BD a
// cada request). A disponibilidade do dia fica no maximo 60s defasada.
export const revalidate = 60;

const planRank: Record<string, number> = {
  black: 3,
  premium: 2,
  essential: 1,
};

const statusRank: Record<string, number> = {
  available_now: 3,
  available_today: 2,
  booked: 1,
};

const maxModelsPerClinic = 3;
const maxFeaturedModels = 12;

// Vitrine da home: ate 3 modelos por casa (antes era 1, e com poucas casas a
// vitrine ficava quase vazia). Quem esta disponivel agora vem primeiro, depois
// disponivel hoje; no empate, destaque da casa e plano mais alto.
function pickFeaturedModels(clinics: StudioClinic[]): FeaturedModel[] {
  return clinics
    .flatMap((clinic) =>
      clinic.professionals
        .filter((p) => p.isActive)
        .sort(
          (a, b) =>
            (statusRank[b.status] || 0) - (statusRank[a.status] || 0) ||
            Number(b.isFeatured) - Number(a.isFeatured)
        )
        .slice(0, maxModelsPerClinic)
        .map((professional) => ({
          model: {
            stageName: professional.stageName,
            slug: professional.slug,
            mainPhotoUrl: professional.mainPhotoUrl,
            status: professional.status,
            clinicName: clinic.name,
            clinicSlug: clinic.slug,
          } satisfies FeaturedModel,
          rank:
            (statusRank[professional.status] || 0) * 10 +
            Number(professional.isFeatured) * 4 +
            (planRank[clinic.plan] || 0),
        }))
    )
    .sort((a, b) => b.rank - a.rank)
    .slice(0, maxFeaturedModels)
    .map(({ model }) => model);
}

function toCarouselClinics(clinics: StudioClinic[]): CarouselClinic[] {
  return clinics
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
}

export default async function Home() {
  const clinics = await getApprovedStudioClinics();
  const featuredModels = pickFeaturedModels(clinics);
  const carouselClinics = toCarouselClinics(clinics);
  const totalModels = clinics.reduce(
    (count, clinic) => count + clinic.professionals.filter((p) => p.isActive).length,
    0
  );
  const citiesCount = new Set(
    clinics.map((clinic) => clinic.city).filter(Boolean)
  ).size;

  // Painel ao vivo: espelha o status real das modelos. "booked" (agenda cheia)
  // e "unavailable" nunca contam como disponivel, e sem disponibilidade nao
  // inventamos numero — o card assume o estado honesto correspondente.
  const publicProfessionals = clinics.flatMap((clinic) =>
    clinic.professionals.filter((p) => p.isActive)
  );
  const availableNow = publicProfessionals.filter(
    (p) => p.status === "available_now"
  );
  const availableToday = publicProfessionals.filter(
    (p) => p.status === "available_today"
  );

  const live = availableNow.length
    ? { tone: "now" as const, label: "Disponível agora", pros: availableNow }
    : availableToday.length
      ? { tone: "today" as const, label: "Disponíveis hoje", pros: availableToday }
      : { tone: "off" as const, label: "Sem disponibilidade agora", pros: [] };

  const availableCount = live.pros.length;
  const heroAvatars = live.pros
    .map((p) => p.mainPhotoUrl)
    .filter((url) => url && !url.includes("/brand/"))
    .slice(0, 5);
  const generatedAt = new Date().toISOString();

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.liveBadge}>
                <i aria-hidden="true" /> Ao vivo · disponibilidade do dia
              </span>
              <h1 className={styles.heroTitle}>
                Massagem sensual com quem está <em>disponível hoje</em>.
              </h1>
              <p className={styles.heroSub}>
                As casas e privês mais desejados para massagem sensual,
                tântrica e relaxante — modelos verificadas, fotos reais e
                contato direto no WhatsApp. Escolha, chame e se entregue com
                discrição total.
              </p>
              <div className={styles.heroActions}>
                <Link href="#modelos" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Ver quem está disponível
                  <ArrowRight size={18} />
                </Link>
                <Link href="/mapa" className={`${styles.btn} ${styles.btnGhost}`}>
                  <MapPin size={18} />
                  Ver o mapa
                </Link>
              </div>

              <ul className={styles.heroTrust}>
                <li>
                  <BadgeCheck size={17} /> Modelos verificadas
                </li>
                <li>
                  <Camera size={17} /> Fotos reais e atuais
                </li>
                <li>
                  <ShieldCheck size={17} /> Discrição total
                </li>
              </ul>
            </div>

            <aside className={styles.heroAside}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardTop}>
                  <span
                    className={`${styles.liveDot} ${
                      live.tone === "now"
                        ? ""
                        : live.tone === "today"
                          ? styles.liveDotToday
                          : styles.liveDotOff
                    }`}
                  >
                    <i aria-hidden="true" /> {live.label}
                  </span>
                  <span className={styles.heroCardTime}>
                    <LiveUpdatedAt iso={generatedAt} />
                  </span>
                </div>

                {heroAvatars.length ? (
                  <div className={styles.avatarStack}>
                    {heroAvatars.map((url, index) => (
                      <span key={`${url}-${index}`} className={styles.avatar}>
                        <Image src={url as string} alt="" fill sizes="52px" />
                      </span>
                    ))}
                    {availableCount > heroAvatars.length ? (
                      <span className={`${styles.avatar} ${styles.avatarMore}`}>
                        +{availableCount - heroAvatars.length}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <p className={styles.heroCardLead}>
                  {live.tone === "off" ? (
                    "Nenhuma modelo disponível no momento"
                  ) : (
                    <>
                      <strong>{availableCount}</strong>{" "}
                      {live.tone === "now"
                        ? availableCount === 1
                          ? "modelo pronta para atender agora"
                          : "modelos prontas para atender agora"
                        : availableCount === 1
                          ? "modelo disponível hoje"
                          : "modelos disponíveis hoje"}
                    </>
                  )}
                </p>

                <div className={styles.heroCardStats}>
                  <span>
                    <strong>{totalModels}</strong>{" "}
                    {totalModels === 1 ? "modelo" : "modelos"}
                  </span>
                  <span>
                    <strong>{clinics.length}</strong>{" "}
                    {clinics.length === 1 ? "casa" : "casas"}
                  </span>
                  <span>
                    <strong>{citiesCount}</strong>{" "}
                    {citiesCount === 1 ? "cidade" : "cidades"}
                  </span>
                </div>

                <Link href="#modelos" className={styles.heroCardLink}>
                  Ver todas <ArrowRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section id="modelos" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <span className={styles.kicker}>Em destaque</span>
              <h2 className={styles.sectionTitle}>Modelos em destaque</h2>
              <p className={styles.sectionText}>
                As massagistas mais desejadas das casas parceiras, com foto real
                e disponibilidade do dia. Deslize, escolha e chame.
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
                As casas em destaque, das mais completas às essenciais. Arraste
                e clique para conhecer cada uma, ou veja todas as casas.
              </p>
            </Reveal>

            <Reveal>
              <ClinicsCarousel clinics={carouselClinics} />
            </Reveal>

            {/* O carrossel mostra so os destaques (pagos a parte); a lista
                completa fica em /clinicas. */}
            <div className={styles.seeAll}>
              <Link href="/clinicas" className={`${styles.btn} ${styles.btnGhost}`}>
                Ver todas as casas
                <ArrowRight size={18} />
              </Link>
            </div>
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
                <Link href="/mapa" className={`${styles.btn} ${styles.btnPrimary}`}>
                  <MapPin size={18} />
                  Abrir o mapa
                </Link>
              </div>
            </Reveal>
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

      <SiteFooter />
    </div>
  );
}
