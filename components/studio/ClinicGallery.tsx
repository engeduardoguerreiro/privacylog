"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import Lightbox from "./Lightbox";

export default function ClinicGallery({ photos }: { photos: string[] }) {
  const galleryPhotos = photos.length
    ? [...photos.slice(0, 4), ...Array(Math.max(0, 4 - photos.length)).fill(photos[0])]
    : [];
  const [activePhoto, setActivePhoto] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const goToPhoto = useCallback(
    (direction: -1 | 1) => {
      setActivePhoto(
        (current) => (current + direction + galleryPhotos.length) % galleryPhotos.length
      );
    },
    [galleryPhotos.length]
  );

  const closeLightbox = useCallback(() => setIsExpanded(false), []);

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
        <Lightbox
          photos={galleryPhotos}
          index={activePhoto}
          onClose={closeLightbox}
          onNavigate={goToPhoto}
        />
      ) : null}
    </>
  );
}
