"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Visualizador de fotos em tela cheia.
 *
 * Vai para o body via portal de proposito: dentro da pagina ele nasceria
 * dentro de .clinic-section, que tem position:relative + z-index e cria um
 * contexto de empilhamento — ali o cabecalho fixo cobriria o botao de fechar
 * e o visitante ficaria preso.
 */
export default function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const hasMultiple = photos.length > 1;
  const current = photos[index] || photos[0];

  useEffect(() => setMounted(true), []);

  // Esc fecha, setas navegam.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!hasMultiple) return;

      if (event.key === "ArrowLeft") onNavigate(-1);
      if (event.key === "ArrowRight") onNavigate(1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, onClose, onNavigate]);

  // Trava a rolagem do fundo enquanto a foto esta aberta.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!mounted || !current) {
    return null;
  }

  return createPortal(
    <div
      className="studio-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      onClick={onClose}
    >
      <button
        type="button"
        className="studio-lightbox-close"
        onClick={onClose}
        aria-label="Fechar foto"
      >
        <X size={22} />
      </button>

      {hasMultiple ? (
        <button
          type="button"
          className="studio-lightbox-nav prev"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(-1);
          }}
          aria-label="Foto anterior"
        >
          <ChevronLeft size={28} />
        </button>
      ) : null}

      <div
        className="studio-lightbox-image"
        onClick={(event) => event.stopPropagation()}
      >
        <Image src={current} alt="" fill sizes="100vw" priority />
      </div>

      {hasMultiple ? (
        <button
          type="button"
          className="studio-lightbox-nav next"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(1);
          }}
          aria-label="Próxima foto"
        >
          <ChevronRight size={28} />
        </button>
      ) : null}
    </div>,
    document.body
  );
}
