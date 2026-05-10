"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogIn,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AgeGate from "@/components/AgeGate";
import BrandLogo from "@/components/BrandLogo";
import PremiumBannerCarousel from "@/components/PremiumBannerCarousel";
import { supabase } from "../lib/supabase";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});

type Clinic = {
  id: number;
  nome: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipo: string;
  plano: string;
  imagens: unknown;
};

const typeFilters = [
  { value: "todos", label: "Todos" },
  { value: "clinica", label: "Clínicas" },
  { value: "massagem", label: "Massagens" },
  { value: "boate", label: "Boates" },
  { value: "prive", label: "Privês" },
];

const stateFilters = [
  { value: "todos", label: "Brasil" },
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "SUL", label: "Sul" },
];

export default function Home() {
  const router = useRouter();
  const [premiumClinics, setPremiumClinics] = useState<Clinic[]>([]);
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("SP");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchPremium() {
      const { data } = await supabase
        .from("clinicas")
        .select("*")
        .eq("plano", "premium");

      setPremiumClinics(data || []);
    }

    fetchPremium();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = searchTerm.trim().toLowerCase();

    const matchedState = stateFilters.find((state) =>
      state.label.toLowerCase().includes(normalized)
    );

    if (matchedState && normalized) {
      setFilterEstado(matchedState.value);
    }
  }

  function getClinicImage(imagens: unknown) {
    const fallback = "https://images.unsplash.com/photo-1566073771259-6a8506099945";

    try {
      if (Array.isArray(imagens)) {
        return imagens[0] || fallback;
      }

      if (typeof imagens === "string") {
        try {
          const parsed = JSON.parse(imagens);

          if (Array.isArray(parsed)) {
            return parsed[0] || fallback;
          }

          return imagens || fallback;
        } catch {
          return imagens || fallback;
        }
      }

      return fallback;
    } catch {
      return fallback;
    }
  }

  return (
    <main className="premium-shell">
      <AgeGate />

      <header className="premium-header">
        <div className="site-container premium-header-inner">
          <BrandLogo markSize={42} textClassName="text-[28px]" />

          <nav className="premium-nav" aria-label="Navegação principal">
            <Link href="#mapa" className="premium-nav-link nav-link-map">
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

      <section className="premium-hero">
        <div className="site-container">
          <p className="premium-kicker">Guia privado nacional</p>
          <h1>
            O guia mais <span>discreto</span> do Brasil
          </h1>
          <p>
            Mapa, destaques premium e comunidade para explorar locais com mais
            contexto, privacidade e confiança.
          </p>

          <form className="premium-search" onSubmit={handleSearch}>
            <MapPin size={20} className="ml-3 shrink-0 text-[#38bdf8]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar cidade, estado ou região"
            />
            <button className="icon-button" type="submit" aria-label="Buscar">
              <Search size={19} />
            </button>
          </form>
        </div>
      </section>

      <section className="site-container">
        <div className="age-notice-strip">
          <ShieldCheck size={18} />
          <span>
            Acesso proibido para menores de 18 anos. Conteúdo e comunidade
            destinados exclusivamente a adultos.
          </span>
        </div>
      </section>

      <section id="mapa" className="site-container pt-4">
        <div className="filter-panel" aria-label="Filtros do mapa">
          <div className="filter-select-row">
            <label className="filter-select-field">
              <span className="filter-select-label">Tipo</span>
              <select
                value={filterTipo}
                onChange={(event) => setFilterTipo(event.target.value)}
                className="filter-select"
              >
                {typeFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-select-field">
              <span className="filter-select-label">Região</span>
              <select
                value={filterEstado}
                onChange={(event) => setFilterEstado(event.target.value)}
                className="filter-select"
              >
                {stateFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="map-frame">
          <Map
            key={filterEstado}
            filterTipo={filterTipo}
            filterEstado={filterEstado}
            searchTerm={searchTerm}
          />
        </div>
      </section>

      <div className="site-container">
        <PremiumBannerCarousel />
      </div>

      <section className="site-container premium-section">
        <div className="section-heading">
          <div>
            <h2 className="section-title">
              Destaques <span>Premium</span>
            </h2>
            <p className="section-description">
              Locais com prioridade visual, selo de destaque e apresentação mais
              forte dentro do guia.
            </p>
          </div>
          <span className="privacy-badge badge-premium">
            <Sparkles size={13} />
            Premium
          </span>
        </div>

        {premiumClinics.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 3600, disableOnInteraction: false }}
            spaceBetween={24}
            slidesPerView={3}
            breakpoints={{
              0: { slidesPerView: 1 },
              700: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
          >
            {premiumClinics.map((clinic) => (
              <SwiperSlide key={clinic.id}>
                <button
                  type="button"
                  className="premium-card w-full text-left"
                  onClick={() => router.push(`/clinica/${clinic.id}`)}
                >
                  <img
                    className="premium-image"
                    src={getClinicImage(clinic.imagens)}
                    alt={clinic.nome}
                  />

                  <div className="premium-card-body">
                    <span className="privacy-badge badge-premium">
                      <Sparkles size={13} />
                      Premium
                    </span>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      {clinic.nome}
                    </h3>

                    <p className="mt-2 text-sm text-[#b8b8c8]">
                      {clinic.cidade} - {clinic.estado}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="privacy-badge badge-verified">
                        <ShieldCheck size={13} />
                        Verificado
                      </span>
                      <span className="text-sm font-bold text-[#f6c453]">
                        4.9
                      </span>
                    </div>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="privacy-card p-7 text-center text-[#b8b8c8]">
            Nenhum destaque premium cadastrado ainda.
          </div>
        )}
      </section>

      <section className="site-container premium-section">
        <div className="privacy-card p-8 text-center md:p-12">
          <span className="privacy-badge badge-purple">Comunidade</span>
          <h2 className="mt-5 text-4xl font-black text-white">
            Quer ver avaliações reais?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#b8b8c8]">
            Entre no fórum privado para acompanhar relatos, dúvidas e conversas
            organizadas por estado e local.
          </p>
          <div className="mt-8">
            <Link href="/forum" className="primary-button">
              Entrar na Comunidade
            </Link>
          </div>
        </div>
      </section>

      <footer className="premium-footer">
        <div className="site-container premium-footer-inner">
          <p>PrivacyLog © 2026</p>
          <div className="flex gap-5">
            <Link href="/forum">Fórum</Link>
            <Link href="/account">Conta</Link>
            <a href="mailto:contato@privacylog.com.br">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
