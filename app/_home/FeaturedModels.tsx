"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import styles from "../home.module.css";

export type FeaturedModel = {
  stageName: string;
  slug: string;
  mainPhotoUrl: string;
  status: string;
  clinicName: string;
  clinicSlug: string;
};

const statusLabels: Record<string, string> = {
  available_now: "Disponível agora",
  available_today: "Disponível hoje",
  booked: "Agenda cheia",
};

export default function FeaturedModels({ models }: { models: FeaturedModel[] }) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className={styles.carousel}>
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={16}
        grabCursor
        loop={models.length > 5}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          0: { slidesPerView: 1.6 },
          480: { slidesPerView: 2.4 },
          760: { slidesPerView: 3.5 },
          1024: { slidesPerView: 5 },
        }}
      >
        {models.map((model) => (
          <SwiperSlide key={`${model.clinicSlug}-${model.slug}`}>
            <Link href={`/studio/clinicas/${model.clinicSlug}`} className={styles.modelCard}>
              <div className={styles.modelImageWrap}>
                {model.mainPhotoUrl ? (
                  <Image
                    src={model.mainPhotoUrl}
                    alt={model.stageName}
                    fill
                    sizes="(max-width: 760px) 45vw, 220px"
                    className={styles.modelImage}
                  />
                ) : null}
                <span
                  className={`${styles.modelStatus} ${
                    model.status === "booked" ? styles.modelStatusBooked : ""
                  }`}
                >
                  {statusLabels[model.status] || "Disponível"}
                </span>
              </div>
              <div className={styles.modelBody}>
                <h3 className={styles.modelName}>{model.stageName}</h3>
                <p className={styles.modelClinic}>{model.clinicName}</p>
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
