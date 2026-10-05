"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import home from "../home.module.css";
import styles from "./clinicas.module.css";

export type DirectoryLocal = {
  id: number;
  nome: string | null;
  bairro: string | null;
  cidade: string | null;
  tipo: string | null;
  imagens?: unknown;
};

const placeholderImage = "/brand/card-placeholder.webp";

const typeLabels: Record<string, string> = {
  clinica: "Clínica",
  massagem: "Massagem",
  boate: "Boate",
  prive: "Privê",
  predio: "Prédio",
};

/** Card de um local do mapa, no mesmo estilo dos cards de casa da home. */
export default function LocalCard({ local }: { local: DirectoryLocal }) {
  const type = typeLabels[(local.tipo || "").toLowerCase()];

  return (
    <Link href={`/clinicas/${local.id}`} className={home.clinicCard}>
      <div className={styles.localImageWrap}>
        {/* lazy + fallback leve: a lista tem dezenas de locais. */}
        <img
          src={getLocalImage(local)}
          alt={local.nome || "Local PrivacyLog"}
          className={styles.localImage}
          width={600}
          height={400}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(placeholderImage)) {
              event.currentTarget.src = placeholderImage;
            }
          }}
        />
        {type ? <span className={styles.typeBadge}>{type}</span> : null}
      </div>
      <div className={home.clinicBody}>
        <h3 className={home.clinicName}>{local.nome}</h3>
        <span className={home.clinicMeta}>
          <MapPin size={14} aria-hidden="true" />{" "}
          {[local.bairro, local.cidade].filter(Boolean).join(" · ")}
        </span>
        <span className={home.clinicMore}>
          Ver detalhes
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}

function getLocalImage(local: DirectoryLocal) {
  const fallback = `/clinicas/${local.id}_01.webp`;
  const imagens = local.imagens;

  try {
    if (Array.isArray(imagens)) {
      return typeof imagens[0] === "string" && imagens[0] ? imagens[0] : fallback;
    }

    if (typeof imagens === "string" && imagens.trim()) {
      const parsed = JSON.parse(imagens);
      return Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0]
        ? parsed[0]
        : fallback;
    }
  } catch {
    return fallback;
  }

  return fallback;
}
