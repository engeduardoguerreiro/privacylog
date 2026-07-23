"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { getProfessionalStatusLabel } from "@/lib/studio/data";
import type { StudioClinic, StudioProfessional } from "@/lib/studio/types";
import Lightbox from "./Lightbox";
import WhatsAppCTA from "./WhatsAppCTA";

export default function ProfessionalCard({
  clinic,
  professional,
}: {
  clinic: StudioClinic;
  professional: StudioProfessional;
}) {
  const photos = useMemo(() => {
    const list = professional.photos?.length
      ? professional.photos
      : [professional.mainPhotoUrl];

    return Array.from(new Set(list.filter(Boolean))).slice(0, 4);
  }, [professional.mainPhotoUrl, professional.photos]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const currentPhoto = photos[activePhoto] || professional.mainPhotoUrl;
  const hasMultiplePhotos = photos.length > 1;

  const goToPhoto = useCallback(
    (direction: -1 | 1) => {
      setActivePhoto((current) => (current + direction + photos.length) % photos.length);
    },
    [photos.length]
  );

  const closeLightbox = useCallback(() => setIsExpanded(false), []);

  return (
    <article className={`studio-professional-card status-${professional.status}`}>
      <div className="studio-professional-media">
        <div className="studio-professional-photo">
          <button
            type="button"
            className="studio-professional-photo-button"
            onClick={() => setIsExpanded(true)}
            aria-label={`Ampliar foto de ${professional.stageName}`}
          >
            <Image src={currentPhoto} alt="" fill sizes="(max-width: 720px) 100vw, 220px" />
          </button>
          {hasMultiplePhotos ? (
            <>
              <button
                type="button"
                className="studio-carousel-nav prev"
                onClick={() => goToPhoto(-1)}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="studio-carousel-nav next"
                onClick={() => goToPhoto(1)}
                aria-label="Próxima foto"
              >
                <ChevronRight size={16} />
              </button>
              <div className="studio-photo-dots" aria-hidden="true">
                {photos.map((photo, index) => (
                  <span
                    key={`${photo}-${index}`}
                    className={index === activePhoto ? "is-active" : ""}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
        {professional.status !== "unavailable" ? (
          <WhatsAppCTA
            clinicId={clinic.id}
            clinicSlug={clinic.slug}
            number={professional.whatsapp || clinic.whatsapp}
            message={`Olá, vi a "${professional.stageName}" na vitrine da "${clinic.name}" e fiquei interessado. Ela está disponível hoje?`}
            professionalId={professional.id}
            source="professional_card"
            label="Agendar"
          />
        ) : null}
      </div>

      <div>
        <span className="studio-badge">
          <Sparkles size={13} />
          {getProfessionalStatusLabel(professional.status)}
        </span>
        <h3>{professional.stageName}</h3>
        <p>{professional.shortDescription}</p>
        <small>
          <Clock size={13} />
          {professional.availabilityWindow}
        </small>
      </div>

      {isExpanded ? (
        <Lightbox
          photos={photos}
          index={activePhoto}
          onClose={closeLightbox}
          onNavigate={goToPhoto}
        />
      ) : null}
    </article>
  );
}
