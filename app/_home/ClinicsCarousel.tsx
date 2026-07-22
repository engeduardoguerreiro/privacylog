"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import styles from "../home.module.css";

export type CarouselClinic = {
  name: string;
  slug: string;
  city: string;
  neighborhood: string;
  address: string;
  mainImageUrl: string;
  plan: string;
};

const planLabels: Record<string, string> = {
  black: "Black",
  premium: "Premium",
  essential: "Essencial",
};

export default function ClinicsCarousel({
  clinics,
}: {
  clinics: CarouselClinic[];
}) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className={styles.carousel}>
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={24}
        grabCursor
        loop={clinics.length > 3}
        autoplay={{ delay: 4600, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          560: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {clinics.map((clinic) => (
          <SwiperSlide key={clinic.slug}>
            <Link
              href={`/studio/clinicas/${clinic.slug}`}
              className={styles.clinicCard}
            >
              <div className={styles.clinicImageWrap}>
                {clinic.mainImageUrl ? (
                  <Image
                    src={clinic.mainImageUrl}
                    alt={clinic.name}
                    fill
                    sizes="(max-width: 760px) 100vw, 360px"
                    className={styles.clinicImage}
                  />
                ) : null}
                <span className={styles.planBadge}>
                  {planLabels[clinic.plan] || clinic.plan}
                </span>
              </div>
              <div className={styles.clinicBody}>
                <h3 className={styles.clinicName}>{clinic.name}</h3>
                <span className={styles.clinicMeta}>
                  {clinic.neighborhood} · {clinic.city}
                </span>
                <p className={styles.clinicAddress}>
                  <MapPin size={15} />
                  {clinic.address}
                </p>
                <span className={styles.clinicMore}>
                  Saiba mais
                  <ArrowUpRight size={17} />
                </span>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={styles.carouselControls}>
        <button
          type="button"
          className={styles.carouselBtn}
          aria-label="Anterior"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          className={styles.carouselBtn}
          aria-label="Próximo"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
