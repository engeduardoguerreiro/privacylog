"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Car,
  DollarSign,
  Globe,
  LogIn,
  MapPin,
  MessageCircle,
  MessageSquare,
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
  lat?: number | string | null;
  lng?: number | string | null;
  tipo?: string | null;
  plano?: string | null;
  imagens?: unknown;
  preco_30_normal?: number | null;
  preco_30_forista?: number | null;
  preco_60_normal?: number | null;
  preco_60_forista?: number | null;
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
        console.error("Erro ao buscar categoria do fÃ³rum:", forumError);
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
    <main className="premium-shell">
      <header className="premium-header">
        <div className="site-container premium-header-inner">
          <BrandLogo markSize={38} textClassName="text-[25px]" />

          <nav className="premium-nav" aria-label="Navegação do local">
            <Link href="/" className="premium-nav-link nav-link-map">
              <MapPin size={16} />
              Mapa
            </Link>
            <Link href="/forum" className="premium-nav-link nav-link-forum">
              <MessageSquare size={16} />
              Fórum
            </Link>
            <Link href="/login" className="premium-nav-link nav-link-login">
              <LogIn size={16} />
              Entrar
            </Link>
            <a
              href="mailto:contato@privacylog.com.br?subject=Quero%20ser%20Premium%20no%20PrivacyLog"
              className="premium-nav-cta"
            >
              <Sparkles size={16} />
              Seja Premium
            </a>
          </nav>
        </div>
      </header>

      <section className="site-container grid gap-6 py-8 lg:grid-cols-[430px_1fr]">
        <aside className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#38bdf8] hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>

          <section className="privacy-card p-5">
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

            <h1 className="mt-5 text-3xl font-black text-white">
              {clinic.nome}
            </h1>
            <p className="mt-2 text-sm text-[#b8b8c8]">
              {clinic.bairro} · {clinic.cidade} - {clinic.estado}
            </p>
            {clinic.descricao ? (
              <p className="mt-4 leading-7 text-[#b8b8c8]">
                {clinic.descricao}
              </p>
            ) : null}
          </section>

          <section className="grid grid-cols-2 gap-3">
            <ActionLink href={clinic.site} icon={<Globe size={17} />} label="Site" />
            <ActionLink
              href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : null}
              icon={<MessageCircle size={17} />}
              label="WhatsApp"
            />
            <ActionLink
              href={clinic.forum || "/forum"}
              icon={<MessageSquare size={17} />}
              label="Fórum"
            />
            <ActionLink
              href={`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${clinic.lat}&dropoff[longitude]=${clinic.lng}`}
              icon={<Car size={17} />}
              label="Uber"
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
          />
        </div>
      ) : null}
    </main>
  );
}

function ActionLink({
  href,
  icon,
  label,
}: {
  href?: string | null;
  icon: ReactNode;
  label: string;
}) {
  if (!href) {
    return (
      <span className="secondary-button min-h-12 opacity-40">
        {icon}
        {label}
      </span>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className="secondary-button min-h-12">
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="secondary-button min-h-12"
    >
      {icon}
      {label}
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
