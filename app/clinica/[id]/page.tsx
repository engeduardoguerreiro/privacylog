"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductHeader from "@/components/layout/ProductHeader";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  DollarSign,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

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

const clinicActionIcons = {
  site: "/brand/clinic-actions/site.png",
  whatsapp: "/brand/clinic-actions/whatsapp.png",
  forum: "/brand/clinic-actions/forum.png",
  uber: "/brand/clinic-actions/uber.png",
};

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

      const { data: forumCategory, error: forumError } = await supabase
        .from("forum_categories")
        .select("id")
        .eq("clinic_id", numericId)
        .maybeSingle();

      if (forumError) {
        console.error("Erro ao buscar categoria do fórum:", forumError);
      }

      setClinic({
        ...(data as Clinic),
        forum: forumCategory?.id
          ? `/forum/categoria/${forumCategory.id}`
          : normalizeForumPath((data as Clinic).forum),
      });
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
    <main className="premium-shell lounge-clinic-detail-page">
      <ProductHeader product="lounge" />

      <section className="site-container clinic-detail-layout grid gap-5 py-7 lg:grid-cols-[360px_1fr]">
        <aside className="clinic-detail-aside space-y-4">
          <Link
            href="/lounge"
            className="clinic-back-link inline-flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>

          <section className="clinic-hero-card privacy-card">
            <div className="flex flex-wrap gap-2">
              <span
                className={`privacy-badge ${
                  isPremium ? "badge-premium" : "badge-purple"
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
              <span className="privacy-badge badge-verified">
                <ShieldCheck size={13} />
                Verificado
              </span>
            </div>

            <h1 className="clinic-hero-title">
              {clinic.nome}
            </h1>
            <p className="clinic-hero-location">
              {clinic.bairro} · {clinic.cidade} - {clinic.estado}
            </p>
            {clinic.descricao ? (
              <p className="clinic-hero-description">
                {clinic.descricao}
              </p>
            ) : null}
          </section>

          <section className="clinic-action-grid" aria-label="Ações da clínica">
            <ActionLink
              href={clinic.site}
              iconSrc={clinicActionIcons.site}
              label="Abrir site"
            />
            <ActionLink
              href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : null}
              iconSrc={clinicActionIcons.whatsapp}
              label="Abrir WhatsApp"
            />
            <ActionLink
              href={clinic.forum || "/forum"}
              iconSrc={clinicActionIcons.forum}
              label="Abrir fórum"
            />
            <ActionLink
              href={`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${clinic.lat}&dropoff[longitude]=${clinic.lng}`}
              iconSrc={clinicActionIcons.uber}
              label="Abrir Uber"
            />
          </section>

          <section className="forum-form-card p-5">
            <h2 className="mb-4 text-lg font-black text-white">Fotos</h2>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className="overflow-hidden rounded-lg border border-[#2d2d44] bg-[#10101c]"
                >
                  <img
                    src={img}
                    className="h-24 w-full object-cover"
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

          <section className="forum-form-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
              <MapPin size={18} />
              Localização
            </h2>
            <div className="space-y-1 text-sm leading-7 text-[#b8b8c8]">
              <p>
                <strong className="text-white">Endereço:</strong>{" "}
                {clinic.endereco || "Não informado"}
              </p>
              <p>
                <strong className="text-white">Estado:</strong>{" "}
                {clinic.estado || "-"}
              </p>
              <p>
                <strong className="text-white">Cidade:</strong>{" "}
                {clinic.cidade || "-"}
              </p>
              <p>
                <strong className="text-white">Bairro:</strong>{" "}
                {clinic.bairro || "-"}
              </p>
            </div>
          </section>

          <section className="forum-form-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
              <DollarSign size={18} />
              Valores
            </h2>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-right text-[#85859a]">
                  <th className="p-2"></th>
                  <th className="p-2">Normal</th>
                  <th className="p-2 text-[#f6c453]">Forista</th>
                </tr>
              </thead>
              <tbody className="text-right text-[#d1d5db]">
                <tr className="border-t border-[#2d2d44]">
                  <td className="p-2 text-left">30 min</td>
                  <td className="p-2">R$ {clinic.preco_30_normal ?? "-"}</td>
                  <td className="p-2 font-black text-[#f6c453]">
                    R$ {clinic.preco_30_forista ?? "-"}
                  </td>
                </tr>
                <tr className="border-t border-[#2d2d44]">
                  <td className="p-2 text-left">1 hora</td>
                  <td className="p-2">R$ {clinic.preco_60_normal ?? "-"}</td>
                  <td className="p-2 font-black text-[#f6c453]">
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
    </main>
  );
}

function ActionLink({
  href,
  iconSrc,
  label,
}: {
  href?: string | null;
  iconSrc: string;
  label: string;
}) {
  const content = (
    <>
      <span className="clinic-action-icon-glow" aria-hidden="true" />
      <Image
        src={iconSrc}
        alt=""
        width={78}
        height={78}
        className="clinic-action-icon-image"
      />
      <span className="sr-only">{label}</span>
    </>
  );

  if (!href) {
    return (
      <span
        className="clinic-action-icon-button is-disabled"
        aria-label={`${label} indisponível`}
        aria-disabled="true"
        title={`${label} indisponível`}
      >
        {content}
      </span>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="clinic-action-icon-button"
        aria-label={label}
        title={label}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="clinic-action-icon-button"
      aria-label={label}
      title={label}
    >
      {content}
    </a>
  );
}

function normalizeForumPath(value: string | null | undefined) {
  if (!value) {
    return "/forum";
  }

  if (value.startsWith("/forum/")) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.pathname.startsWith("/forum/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return "/forum";
  }

  return "/forum";
}
