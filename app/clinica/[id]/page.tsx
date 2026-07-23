"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import SiteHeader from "@/app/_home/SiteHeader";
import SiteFooter from "@/app/_home/SiteFooter";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Car,
  DollarSign,
  Globe,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import styles from "./clinica.module.css";

type Clinic = {
  id: number;
  nome: string;
  descricao?: string | null;
  contato?: string | null;
  site?: string | null;
  forum?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  lat: number | string | null;
  lng?: number | string | null;
  tipo?: string | null;
  plano?: string | null;
  imagens?: unknown;
  preco_30_normal?: number | null;
  preco_30_forista?: number | null;
  preco_60_normal?: number | null;
  preco_60_forista?: number | null;
};

const fallbackClinicImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945";

function parseImages(imagens: unknown) {
  if (Array.isArray(imagens)) {
    return imagens.filter(
      (image): image is string => typeof image === "string" && image.length > 0
    );
  }

  if (typeof imagens === "string" && imagens.trim()) {
    try {
      const parsed = JSON.parse(imagens);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (image): image is string =>
            typeof image === "string" && image.length > 0
        );
      }
    } catch {
      return [imagens];
    }
  }

  return [];
}

function getClinicImages(clinic: Clinic) {
  const storedImages = parseImages(clinic.imagens);

  if (storedImages.length > 0) {
    return storedImages.slice(0, 3);
  }

  return [
    `/clinicas/${clinic.id}_01.webp`,
    `/clinicas/${clinic.id}_02.webp`,
    `/clinicas/${clinic.id}_03.webp`,
  ];
}

export default function ClinicaPage() {
  const params = useParams();
  const id = params.id as string;
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClinic() {
      const numericId = Number(id);

      if (!id || isNaN(numericId)) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("clinicas")
        .select("*")
        .eq("id", numericId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar clínica:", error);
      }

      if (!data) {
        setClinic(null);
        setLoading(false);
        return;
      }

      setClinic(data as Clinic);
      setLoading(false);
    }

    fetchClinic();
  }, [id]);

  if (loading) {
    return (
      <main className="premium-shell flex min-h-screen items-center justify-center text-[#b8b8c8]">
        Carregando...
      </main>
    );
  }

  if (!clinic) {
    return (
      <main className="premium-shell flex min-h-screen items-center justify-center text-[#b8b8c8]">
        Local não encontrado
      </main>
    );
  }

  const images = getClinicImages(clinic);
  const isPremium =
    String(clinic.plano || "").trim().toLowerCase() === "premium";
  const whatsappNumber = String(clinic.contato || "").replace(/\D/g, "");

  return (
    <main className={`${styles.page} lounge-clinic-detail-page`}>
      <SiteHeader />

      <section className="site-container clinic-detail-layout grid gap-5 py-7 lg:grid-cols-[360px_1fr]">
        <aside className="clinic-detail-aside space-y-4">
          <Link href="/lounge/mapa" className={styles.back}>
            <ArrowLeft size={16} />
            Voltar para o mapa
          </Link>

          <section className={styles.card}>
            <div className={styles.badges}>
              <span
                className={`${styles.badge} ${
                  isPremium ? styles.badgePremium : styles.badgeFree
                }`}
              >
                {isPremium ? (
                  <>
                    <Sparkles size={13} />
                    Premium
                  </>
                ) : (
                  "Free"
                )}
              </span>
              <span className={`${styles.badge} ${styles.badgeVerified}`}>
                <ShieldCheck size={13} />
                Verificado
              </span>
            </div>

            <h1 className={styles.title}>{clinic.nome}</h1>
            <p className={styles.location}>
              {clinic.bairro} · {clinic.cidade} - {clinic.estado}
            </p>
            {clinic.descricao ? (
              <p className={styles.description}>{clinic.descricao}</p>
            ) : null}
          </section>

          <section className={styles.actions} aria-label="Ações da clínica">
            <ActionLink href={clinic.site} icon={<Globe size={22} />} label="Site" />
            <ActionLink
              href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : null}
              icon={<MessageCircle size={22} />}
              label="WhatsApp"
              whats
            />
            <ActionLink
              href={
                clinic.lat && clinic.lng
                  ? `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${clinic.lat}&dropoff[longitude]=${clinic.lng}`
                  : null
              }
              icon={<Car size={22} />}
              label="Uber"
            />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Fotos</h2>
            <div className={styles.photoGrid}>
              {images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={styles.photo}
                >
                  <img
                    src={img}
                    alt={`${clinic.nome} foto ${index + 1}`}
                    onError={(event) => {
                      if (event.currentTarget.src !== fallbackClinicImage) {
                        event.currentTarget.src = fallbackClinicImage;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <MapPin size={18} />
              Localização
            </h2>
            <div className={styles.infoList}>
              <p>
                <strong>Endereço:</strong> {clinic.endereco || "Não informado"}
              </p>
              <p>
                <strong>Estado:</strong> {clinic.estado || "-"}
              </p>
              <p>
                <strong>Cidade:</strong> {clinic.cidade || "-"}
              </p>
              <p>
                <strong>Bairro:</strong> {clinic.bairro || "-"}
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <DollarSign size={18} />
              Valores
            </h2>

            <table className={styles.priceTable}>
              <thead>
                <tr>
                  <th></th>
                  <th>Normal</th>
                  <th className={styles.forista}>Forista</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.label}>30 min</td>
                  <td>R$ {clinic.preco_30_normal ?? "-"}</td>
                  <td className={styles.forista}>
                    R$ {clinic.preco_30_forista ?? "-"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>1 hora</td>
                  <td>R$ {clinic.preco_60_normal ?? "-"}</td>
                  <td className={styles.forista}>
                    R$ {clinic.preco_60_forista ?? "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </aside>

        <section className="map-frame min-h-[420px] lg:h-[calc(100vh-130px)]">
          <iframe
            width="100%"
            height="100%"
            className="border-0"
            loading="lazy"
            src={`https://www.google.com/maps?q=${clinic.lat},${clinic.lng}&z=16&output=embed`}
          />
        </section>
      </section>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#10101c] text-white"
            onClick={() => setSelectedImage(null)}
          >
            <X size={22} />
          </button>
          <img
            src={selectedImage}
            alt="Imagem ampliada"
            className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
            onClick={(event) => event.stopPropagation()}
            onError={(event) => {
              if (event.currentTarget.src !== fallbackClinicImage) {
                event.currentTarget.src = fallbackClinicImage;
              }
            }}
          />
        </div>
      ) : null}

      <SiteFooter />
    </main>
  );
}

function ActionLink({
  href,
  icon,
  label,
  whats = false,
}: {
  href?: string | null;
  icon: ReactNode;
  label: string;
  whats?: boolean;
}) {
  const className = `${styles.action} ${whats ? styles.actionWhats : ""}`;

  const content = (
    <>
      {icon}
      {label}
    </>
  );

  if (!href) {
    return (
      <span
        className={`${className} ${styles.actionDisabled}`}
        aria-disabled="true"
        title={`${label} indisponível`}
      >
        {content}
      </span>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} title={label}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      title={label}
    >
      {content}
    </a>
  );
}

