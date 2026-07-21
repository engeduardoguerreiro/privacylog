import Image from "next/image";
import { BadgeCheck, MapPin, Navigation } from "lucide-react";
import { getPlanLabel, getStudioClinicPrimaryUrl } from "@/lib/studio/data";
import type { StudioClinic } from "@/lib/studio/types";
import WhatsAppCTA from "./WhatsAppCTA";

export default function ClinicPublicHero({ clinic }: { clinic: StudioClinic }) {
  return (
    <section className="studio-clinic-hero">
      <Image src={clinic.mainImageUrl} alt="" fill sizes="100vw" priority />
      <div className="studio-clinic-hero-overlay" />
      <div className="studio-container studio-clinic-hero-content">
        <span className="studio-kicker">Parceira PrivacyLog Studio</span>
        <h1>{clinic.name}</h1>
        <p>
          <MapPin size={17} />
          {clinic.neighborhood} - {clinic.city}, {clinic.state}
        </p>
        <div className="studio-badge-row">
          <span className="studio-badge gold">
            <BadgeCheck size={14} />
            Parceira PrivacyLog
          </span>
          <span className="studio-badge">{getPlanLabel(clinic.plan)}</span>
          <span className="studio-badge is-live">Aberta agora</span>
        </div>
        <code className="studio-hero-domain">
          {getStudioClinicPrimaryUrl(clinic).replace("https://", "")}
        </code>
        <div className="studio-actions">
          <WhatsAppCTA
            number={clinic.whatsapp}
            message={`Ola, vi a ${clinic.name} no PrivacyLog Studio e quero fazer uma reserva.`}
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${clinic.neighborhood}, ${clinic.city}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="studio-button secondary"
          >
            <Navigation size={17} />
            Como chegar
          </a>
        </div>
      </div>
    </section>
  );
}
