"use client";

import Link from "next/link";
import { Megaphone, Sparkles, ShieldCheck } from "lucide-react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const slides = [
  {
    badge: "Destaque Premium",
    title: "Apareça para milhares de visitantes qualificados.",
    text: "Planos para clínicas assinantes, privês parceiros, modelos solo e marcas que querem presença discreta dentro do PrivacyLog.",
    metric: "Alta intenção",
    icon: Sparkles,
  },
  {
    badge: "Anúncio verificado",
    title: "Seu local com mais confiança e presença no mapa.",
    text: "Destaques com visual premium, posicionamento estratégico e chamada direta para visitantes interessados.",
    metric: "Mapa + fórum",
    icon: ShieldCheck,
  },
  {
    badge: "Mídia privada",
    title: "Uma vitrine sofisticada para parceiros do segmento.",
    text: "Espaço único para divulgar ofertas, lançamentos e perfis sem poluir a experiência principal.",
    metric: "Exclusividade",
    icon: Megaphone,
  },
];

export default function PremiumBannerCarousel() {
  return (
    <section className="premium-banner">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 5200, disableOnInteraction: false }}
        loop
      >
        {slides.map((slide) => {
          const Icon = slide.icon;

          return (
            <SwiperSlide key={slide.title}>
              <div className="premium-banner-slide">
                <div>
                  <span className="privacy-badge badge-premium">
                    <Icon size={13} />
                    {slide.badge}
                  </span>
                  <h2 className="premium-banner-title">{slide.title}</h2>
                  <p className="premium-banner-text">{slide.text}</p>
                  <div className="mt-7">
                    <Link
                      href="mailto:contato@privacylog.com.br?subject=Quero anunciar no PrivacyLog"
                      className="primary-button"
                    >
                      Quero anunciar
                    </Link>
                  </div>
                </div>

                <div className="premium-banner-panel">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#38bdf8]">
                    PrivacyLog Ads
                  </p>
                  <div className="mt-5 text-4xl font-black text-white">
                    {slide.metric}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#b8b8c8]">
                    Um ponto principal de monetização, com visual forte e
                    controlado para preservar a experiência premium do guia.
                  </p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
