import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import ClinicGallery from "@/components/studio/ClinicGallery";
import ClinicLandingFooter from "@/components/studio/ClinicLandingFooter";
import ClinicLandingHeader from "@/components/studio/ClinicLandingHeader";
import OpeningHours from "@/components/studio/OpeningHours";
import ProfessionalCard from "@/components/studio/ProfessionalCard";
import { StudioPageViewTracker, StudioTrackedWhatsAppLink } from "@/components/studio/StudioAnalyticsTracker";
import { Clock3, MapPin, MessageCircle, Navigation, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { buildWhatsAppUrl, studioClinics } from "@/lib/studio/data";
import { clinicThemeVars, getClinicTheme } from "@/lib/studio/themes";
import {
  getApprovedStudioClinicBySlug,
  isPlaceholderImage,
} from "@/lib/studio/db";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return studioClinics.map((clinic) => ({ slug: clinic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const clinic = await getApprovedStudioClinicBySlug(slug);

  if (!clinic) {
    return pageMetadata({
      title: "Clinica nao encontrada",
      description: "Clinica nao encontrada no PrivacyLog Studio.",
      product: "studio",
    });
  }

  return pageMetadata({
    title: `${clinic.name} | PrivacyLog Studio`,
    description: `Conheca ${clinic.name}, uma parceira PrivacyLog Studio com ambiente reservado, equipe em destaque e WhatsApp para reserva.`,
    product: "studio",
    path: `/clinicas/${clinic.slug}`,
    image: clinic.mainImageUrl,
  });
}

export default async function StudioClinicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clinic = await getApprovedStudioClinicBySlug(slug);

  if (!clinic) {
    notFound();
  }

  const professionals = clinic.professionals.filter((professional) => professional.isActive);
  const whatsappMessage = `Olá, vim pela vitrine da ${clinic.name} e gostaria de consultar disponibilidade para hoje.`;
  const mapQuery = [clinic.address, clinic.neighborhood, clinic.city, clinic.state]
    .filter(Boolean)
    .join(", ");
  const hasCover = !isPlaceholderImage(clinic.mainImageUrl);
  const galleryPhotos = clinic.photos.filter((photo) => !isPlaceholderImage(photo));

  return (
    <main
      className="clinic-landing"
      id="inicio"
      style={clinicThemeVars(getClinicTheme(clinic.theme))}
    >
      <StudioPageViewTracker clinicId={clinic.id} clinicSlug={clinic.slug} />
      <ClinicLandingHeader clinic={clinic} />

      <section className={`clinic-hero${hasCover ? "" : " clinic-hero-plain"}`}>
        {hasCover ? (
          <>
            <Image src={clinic.mainImageUrl} alt="" fill sizes="100vw" priority />
            <div className="clinic-hero-overlay" />
          </>
        ) : null}
        <div className="clinic-hero-content">
          <p className="clinic-kicker">{clinic.name}</p>
          <h1>Experiência premium em massagem, relaxamento e bem-estar</h1>
          <p>
            Ambiente reservado, atendimento profissional e horários atualizados diariamente.
          </p>
          <div className="clinic-hero-actions">
            <Link href="#profissionais">Ver profissionais</Link>
            <StudioTrackedWhatsAppLink
              href={buildWhatsAppUrl(clinic.whatsapp, whatsappMessage)}
              clinicId={clinic.id}
              clinicSlug={clinic.slug}
              source="hero"
            >
              <MessageCircle size={18} />
              Agendar pelo WhatsApp
            </StudioTrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="clinic-feature-strip" aria-label="Diferenciais">
        <span>
          <UsersRound size={22} />
          Ambiente reservado
        </span>
        <span>
          <Sparkles size={22} />
          Atendimento profissional
        </span>
        <span>
          <Clock3 size={22} />
          Horários atualizados
        </span>
        <span>
          <ShieldCheck size={22} />
          Discrição e confidencialidade
        </span>
      </section>

      <section className="clinic-section clinic-intro">
        <div>
          <p className="clinic-kicker">Ambiente reservado</p>
          <h2>{clinic.name}</h2>
          <p>{clinic.description}</p>
        </div>
        <div className="clinic-location-pill">
          <MapPin size={18} />
          {clinic.neighborhood}, {clinic.city} - {clinic.state}
        </div>
      </section>

      <section className="clinic-section" id="profissionais">
        <div className="clinic-section-title">
          <p className="clinic-kicker">Disponibilidade do dia</p>
          <h2>Nossas modelos</h2>
        </div>
        <div className="clinic-professional-grid">
          {professionals.length ? (
            professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  clinic={clinic}
                  professional={professional}
                />
            ))
          ) : (
            <p className="clinic-empty">A casa ainda não publicou profissionais ativas para hoje.</p>
          )}
        </div>
        {professionals.length > 4 ? (
          <Link href="#profissionais" className="clinic-view-more">
            Ver todas as modelos
            <Navigation size={15} />
          </Link>
        ) : null}
      </section>

      {galleryPhotos.length ? (
        <section className="clinic-section">
          <div className="clinic-section-title">
            <p className="clinic-kicker">Entre no clima</p>
            <h2>Atmosfera da casa</h2>
          </div>
          <ClinicGallery photos={galleryPhotos} />
        </section>
      ) : null}

      <section className="clinic-section clinic-info-grid">
          <article>
            <p className="clinic-kicker">Quando visitar</p>
            <OpeningHours hours={clinic.openingHours} />
          </article>
          <article className="studio-map-box clinic-map-box">
            <p className="clinic-kicker">Endereço</p>
            <h2>{clinic.neighborhood}, {clinic.city}</h2>
            <p>{clinic.address}</p>
            <iframe
              title={`Mapa de ${clinic.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              className="studio-map-embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="clinic-secondary-link"
            >
              <Navigation size={17} />
              Abrir no Google Maps
            </a>
          </article>
      </section>

      <ClinicLandingFooter clinic={clinic} />

      <StudioTrackedWhatsAppLink
        className="clinic-whatsapp-fab"
        href={buildWhatsAppUrl(clinic.whatsapp, whatsappMessage)}
        clinicId={clinic.id}
        clinicSlug={clinic.slug}
        source="floating"
        aria-label="Agendar pelo WhatsApp"
      >
        <MessageCircle size={22} />
        <span>Agendar</span>
      </StudioTrackedWhatsAppLink>
    </main>
  );
}
