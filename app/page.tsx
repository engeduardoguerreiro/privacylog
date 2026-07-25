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
import styles from "./home.module.css";

export const metadata = pageMetadata({
  title: "PrivacyLog | Casas de massagem, clínicas e privês",
  description:
    "O guia premium de casas de massagem, clínicas e privês com página própria, modelos verificadas e presença no mapa. Descubra as casas parceiras.",
});

// ISR: a home e cacheada e regenerada a cada 60s (em vez de consultar o BD a
// cada request). A disponibilidade do dia fica no maximo 60s defasada.
export const revalidate = 60;

const planRank: Record<string, number> = {
  black: 3,
  premium: 2,
  essential: 1,
};

// Uma modelo por casa cadastrada: a que estiver ativa no dia
// (prioriza "disponível agora", depois destaque, senão a primeira ativa).
function pickFeaturedModels(clinics: StudioClinic[]): FeaturedModel[] {
  return clinics
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

  // Gatilho de retenção: quem está disponível agora (prova social + urgência).
  const activeProfessionals = clinics.flatMap((clinic) =>
    clinic.professionals.filter((p) => p.isActive)
  );
  const availableNow = activeProfessionals.filter(
    (p) => p.status === "available_now"
  );
  const spotlightPros = availableNow.length ? availableNow : activeProfessionals;
  const availableCount = spotlightPros.length;
  const heroAvatars = spotlightPros
    .map((p) => p.mainPhotoUrl)
    .filter((url) => url && !url.includes("/brand/"))
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.liveBadge}>
                <i aria-hidden="true" /> Ao vivo · atualizado agora
              </span>
              <h1 className={styles.heroTitle}>
                As melhores casas, com fotos reais e <em>atualizadas</em>.
              </h1>
              <p className={styles.heroSub}>
                Clínicas, casas e privês selecionados em um só lugar — com
                modelos verificadas, disponibilidade do dia e discrição total.
                Encontre agora quem está disponível perto de você.
              </p>
              <div className={styles.heroActions}>
                <Link href="#modelos" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Ver quem está disponível
                  <ArrowRight size={18} />
                </Link>
                <Link href="/lounge/mapa" className={`${styles.btn} ${styles.btnGhost}`}>
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
                  <span className={styles.liveDot}>
                    <i aria-hidden="true" /> Disponível agora
                  </span>
                  <span className={styles.heroCardTime}>há instantes</span>
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
                  <strong>{availableCount}</strong>{" "}
                  {availableCount === 1 ? "modelo pronta" : "modelos prontas"} para
                  atender hoje
                </p>

                <div className={styles.heroCardStats}>
                  <span>
                    <strong>{totalModels}</strong> modelos
                  </span>
                  <span>
                    <strong>{clinics.length}</strong> casas
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
