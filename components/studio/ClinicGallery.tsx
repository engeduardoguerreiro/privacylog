"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ClinicGallery({ photos }: { photos: string[] }) {
  const galleryPhotos = photos.length
    ? [...photos.slice(0, 4), ...Array(Math.max(0, 4 - photos.length)).fill(photos[0])]
    : [];
  const [activePhoto, setActivePhoto] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMultiplePhotos = galleryPhotos.length > 1;
  const currentPhoto = galleryPhotos[activePhoto] || galleryPhotos[0];

  function goToPhoto(direction: -1 | 1) {
    setActivePhoto((current) => (current + direction + galleryPhotos.length) % galleryPhotos.length);
  }

  return (
    <>
      <div className="studio-gallery">
        {galleryPhotos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            aria-label={`Ampliar foto ${index + 1}`}
            onClick={() => {
              setActivePhoto(index);
              setIsExpanded(true);
            }}
          >
            <Image src={photo} alt="" fill sizes="260px" />
          </button>
        ))}
      </div>
      {isExpanded ? (
        <div className="studio-lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="studio-lightbox-close"
            onClick={() => setIsExpanded(false)}
            aria-label="Fechar foto"
          >
            <X size={22} />
          </button>
          {hasMultiplePhotos ? (
            <button
              type="button"
              className="studio-lightbox-nav prev"
              onClick={() => goToPhoto(-1)}
              aria-label="Foto anterior"
            >
              <ChevronLeft size={28} />
            </button>
          ) : null}
          <div className="studio-lightbox-image">
            <Image src={currentPhoto} alt="" fill sizes="100vw" priority />
          </div>
          {hasMultiplePhotos ? (
            <button
              type="button"
              className="studio-lightbox-nav next"
              onClick={() => goToPhoto(1)}
              aria-label="Proxima foto"
            >
              <ChevronRight size={28} />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
