"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import styles from "../home.module.css";

export type ExplorerClinic = {
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

export default function ClinicsExplorer({
  clinics,
}: {
  clinics: ExplorerClinic[];
}) {
  const cities = useMemo(() => {
    const unique = Array.from(new Set(clinics.map((clinic) => clinic.city)));
    return ["Todas", ...unique];
  }, [clinics]);

  const [city, setCity] = useState("Todas");

  const visible =
    city === "Todas"
      ? clinics
      : clinics.filter((clinic) => clinic.city === city);

  return (
    <>
      <div className={styles.filterBar} role="tablist" aria-label="Filtrar por cidade">
        {cities.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={city === option}
            className={`${styles.filterChip} ${
              city === option ? styles.filterChipActive : ""
            }`}
            onClick={() => setCity(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className={styles.vitrineGrid} key={city}>
        {visible.map((clinic) => (
          <Link
            key={clinic.slug}
            href={`/studio/${clinic.slug}`}
            className={`${styles.clinicCard} ${styles.reveal} ${styles.isVisible}`}
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
        ))}
      </div>
    </>
  );
}
