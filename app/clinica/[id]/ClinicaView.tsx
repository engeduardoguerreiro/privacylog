"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import SiteHeader from "@/app/_home/SiteHeader";
import SiteFooter from "@/app/_home/SiteFooter";
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
import {
  fallbackClinicImage,
  getClinicDescription,
  getClinicImages,
  type Clinic,
} from "./data";
import styles from "./clinica.module.css";

// Recebe o local ja buscado no servidor; aqui so fica o estado da galeria
export default function ClinicaView({ clinic }: { clinic: Clinic }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = getClinicImages(clinic);
  const isPremium =
    String(clinic.plano || "").trim().toLowerCase() === "premium";
  const whatsappNumber = String(clinic.contato || "").replace(/\D/g, "");

  return (
    <main className={`${styles.page} lounge-clinic-detail-page`}>
      <SiteHeader />

      <section className="site-container clinic-detail-layout grid gap-5 py-7 lg:grid-cols-[360px_1fr]">
        <aside className="clinic-detail-aside space-y-4">
          <Link href="/mapa" className={styles.back}>
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
            {clinic.nome ? (
              <p className={styles.description}>{getClinicDescription(clinic)}</p>
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
