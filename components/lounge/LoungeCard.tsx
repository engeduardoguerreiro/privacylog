"use client";

import Link from "next/link";
import { MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

export type LoungeLocation = {
  id: number;
  nome: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  tipo: string | null;
  plano: string | null;
  contato?: string | null;
  imagens?: unknown;
};

export default function LoungeCard({ location }: { location: LoungeLocation }) {
  const isPremium = location.plano === "premium";
  const whatsappNumber = String(location.contato || "").replace(/\D/g, "");

  return (
    <article className="premium-card lounge-location-card">
      <img
        src={getLocationImage(location)}
        alt={location.nome || "Local PrivacyLog"}
        className="premium-image"
        onError={(event) => {
          event.currentTarget.src =
            "https://images.unsplash.com/photo-1566073771259-6a8506099945";
        }}
      />

      <div className="premium-card-body">
        <div className="flex flex-wrap gap-2">
          {isPremium ? (
            <span className="privacy-badge badge-premium">
              <Sparkles size={13} />
              Premium
            </span>
          ) : null}
          <span className="privacy-badge badge-verified">
            <ShieldCheck size={13} />
            Verificado
          </span>
        </div>

        <h3 className="mt-4 text-xl font-black text-white">{location.nome}</h3>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          {[location.bairro, location.cidade, location.estado]
            .filter(Boolean)
            .join(" - ")}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={`/lounge/clinicas/${location.id}`} className="primary-button">
            Ver detalhes
          </Link>
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          ) : (
            <span className="secondary-button opacity-45">WhatsApp</span>
          )}
        </div>
      </div>
    </article>
  );
}

function getLocationImage(location: LoungeLocation) {
  const imagens = location.imagens;

  try {
    if (Array.isArray(imagens)) {
      return imagens[0] || `/clinicas/${location.id}_01.webp`;
    }

    if (typeof imagens === "string" && imagens.trim()) {
      const parsed = JSON.parse(imagens);
      return Array.isArray(parsed)
        ? parsed[0] || `/clinicas/${location.id}_01.webp`
        : imagens;
    }
  } catch {
    return `/clinicas/${location.id}_01.webp`;
  }

  return `/clinicas/${location.id}_01.webp`;
}
