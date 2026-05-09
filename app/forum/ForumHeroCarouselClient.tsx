"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { ForumAd } from "./forum-types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const fallbackAds: ForumAd[] = [
  {
    id: 0,
    titulo: "Destaque Premium no fórum PrivacyLog",
    descricao:
      "Uma vitrine discreta para clínicas assinantes, modelos solo e campanhas especiais aparecerem no ponto mais nobre da comunidade.",
    imagem: "/logo-mark.png",
    link: "mailto:contato@privacylog.com.br?subject=Quero anunciar no fórum PrivacyLog",
    ativo: true,
    ordem: 0,
    tipo: "campanha",
    created_at: null,
  },
];

const tipoConfig = {
  clinica: {
    label: "Premium",
    badgeClass: "badge-premium",
    eyebrow: "Clínica parceira",
    icon: Crown,
  },
  modelo: {
    label: "Patrocinado",
    badgeClass: "badge-private",
    eyebrow: "Modelo solo",
    icon: Sparkles,
  },
  campanha: {
    label: "Patrocinado",
    badgeClass: "badge-purple",
    eyebrow: "Campanha PrivacyLog",
    icon: Megaphone,
  },
};

const fallbackLink =
  "mailto:contato@privacylog.com.br?subject=Quero anunciar no fórum PrivacyLog";

export default function ForumHeroCarouselClient({ ads }: { ads: ForumAd[] }) {
  const slides = ads.length > 0 ? ads : fallbackAds;
  const hasManySlides = slides.length > 1;

  return (
    <section className="forum-hero-carousel" aria-label="Destaques patrocinados">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={
          hasManySlides ? { delay: 6200, disableOnInteraction: false } : false
        }
        loop={hasManySlides}
        navigation={
          hasManySlides
            ? {
                nextEl: ".forum-hero-carousel .forum-ad-next",
                prevEl: ".forum-hero-carousel .forum-ad-prev",
              }
            : false
        }
        pagination={
          hasManySlides
            ? {
                clickable: true,
                el: ".forum-hero-carousel .forum-ad-pagination",
              }
            : false
        }
        slidesPerView={1}
      >
        {slides.map((ad) => {
          const config =
            tipoConfig[ad.tipo as keyof typeof tipoConfig] ||
            tipoConfig.campanha;
          const Icon = config.icon;
          const href = getSafeHref(ad.link);
          const imageUrl = getSafeImageUrl(ad.imagem);

          return (
            <SwiperSlide key={`${ad.id}-${ad.titulo}`}>
              <article className="forum-ad-slide">
                <div className="forum-ad-content">
                  <div className="forum-ad-badges">
                    <span className={`privacy-badge ${config.badgeClass}`}>
                      <Icon size={13} />
                      {config.label}
                    </span>
                    <span className="forum-ad-eyebrow">{config.eyebrow}</span>
                  </div>

                  <h2>{ad.titulo}</h2>
                  <p>
                    {ad.descricao ||
                      "Espaço premium para anunciantes e campanhas especiais do PrivacyLog."}
                  </p>

                  <div className="forum-ad-actions">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="forum-ad-cta"
                      data-ad-id={ad.id}
                      data-ad-type={ad.tipo || "campanha"}
                    >
                      {ad.id === 0 ? "Quero anunciar" : "Quero conhecer"}
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>

                <div
                  className="forum-ad-media"
                  style={
                    imageUrl
                      ? { backgroundImage: `url("${imageUrl}")` }
                      : undefined
                  }
                  aria-hidden="true"
                >
                  <div className="forum-ad-media-overlay" />
                  <div className="forum-ad-media-copy">
                    <span>PrivacyLog Ads</span>
                    <strong>Espaço nobre</strong>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {hasManySlides ? (
        <div className="forum-ad-controls">
          <button
            aria-label="Anúncio anterior"
            className="forum-ad-arrow forum-ad-prev"
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="forum-ad-pagination" />
          <button
            aria-label="Próximo anúncio"
            className="forum-ad-arrow forum-ad-next"
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function getSafeHref(value: string | null) {
  if (!value) {
    return fallbackLink;
  }

  if (value.startsWith("mailto:") || value.startsWith("tel:")) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    if (value.startsWith("/")) {
      return value;
    }
  }

  return fallbackLink;
}

function getSafeImageUrl(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value.includes('"') || value.includes("'") ? null : value;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}
