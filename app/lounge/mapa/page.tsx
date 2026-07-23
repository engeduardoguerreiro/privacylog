"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import {
  CircleDollarSign,
  Home,
  MapIcon,
  Menu,
  PlusCircle,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import AgeGate from "@/components/AgeGate";
import SiteHeader from "@/app/_home/SiteHeader";
import SiteFooter from "@/app/_home/SiteFooter";
import { supabase } from "@/lib/supabase";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const Map = dynamic(() => import("@/components/Map"), {
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
  privacylog_black?: boolean | null;
  imagens: unknown;
  preco_60_normal?: number | string | null;
  preco_60_forista?: number | string | null;
};

type LoungeFilterState = {
  status: "todos" | "abertos" | "fechados";
  tipo: "todos" | "clinica" | "massagem" | "boate" | "prive" | "predio";
  minRating: number;
  maxPrice: number;
  descontoForista: boolean;
  milhagem: boolean;
  maxDistance: number;
};

const stateFilters = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "SUL", label: "Sul" },
  { value: "todos", label: "Brasil" },
];

const defaultFilters: LoungeFilterState = {
  status: "todos",
  tipo: "todos",
  minRating: 0,
  maxPrice: 1000,
  descontoForista: false,
  milhagem: false,
  maxDistance: 100,
};

const statusOptions = [
  { value: "todos", label: "Todos" },
  { value: "abertos", label: "Abertos" },
  { value: "fechados", label: "Fechados" },
] as const;

const typeOptions = [
  { value: "todos", label: "Todos" },
  { value: "clinica", label: "Clínica" },
  { value: "massagem", label: "Massagem" },
  { value: "boate", label: "Boate" },
  { value: "prive", label: "Privê" },
  { value: "predio", label: "Prédio" },
] as const;

export default function LoungePage() {
  const [premiumClinics, setPremiumClinics] = useState<Clinic[]>([]);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LoungeFilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] =
    useState<LoungeFilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchPremium() {
      const selectFields =
        "id,nome,bairro,cidade,estado,tipo,plano,privacylog_black,imagens,preco_60_normal,preco_60_forista";
      const fallbackSelectFields =
        "id,nome,bairro,cidade,estado,tipo,plano,imagens,preco_60_normal,preco_60_forista";
      const result = await supabase
        .from("clinicas")
        .select(selectFields)
        .order("id", { ascending: true });

      if (result.error) {
        const fallbackResult = await supabase
          .from("clinicas")
          .select(fallbackSelectFields)
          .order("id", { ascending: true });

        if (fallbackResult.error) {
          console.error(fallbackResult.error);
          setPremiumClinics([]);
          return;
        }

        setPremiumClinics(
          ((fallbackResult.data || []) as Clinic[])
            .filter(isPromotedClinic)
            .slice(0, 12)
        );
        return;
      }

      setPremiumClinics(
        ((result.data || []) as Clinic[]).filter(isPromotedClinic).slice(0, 12)
      );
    }

    fetchPremium();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeText(searchTerm);
    const matchedState = stateFilters.find((state) =>
      normalizeText(state.label).includes(normalized)
    );

    if (matchedState && normalized) {
      setFilterEstado(matchedState.value);
    }
  }

  function openFilters() {
    setDraftFilters(filters);
    setFilterOpen(true);
  }

  function applyFilters() {
    setFilters(draftFilters);
    setFilterOpen(false);
  }

  function clearFilters() {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  }

  return (
    <main className="lounge-map-shell">
      <AgeGate />

      <SiteHeader />

      <div
        style={{
          width: "100%",
          maxWidth: 1160,
          margin: "0 auto",
          padding: "18px clamp(20px, 5vw, 48px) 0",
        }}
      >
        <form className="lounge-map-search" onSubmit={handleSearch}>
          <Search size={22} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome ou endereço..."
            aria-label="Buscar por nome ou endereço"
          />
        </form>
      </div>

      <section className="lounge-map-hero" aria-label="Apresentação do mapa">
        <div className="lounge-map-hero-copy">
          <p>Mapa PrivacyLog Lounge</p>
          <h1>
            Encontre clínicas <span>premium</span> no mapa
          </h1>
          <strong>
            Navegue por espaços verificados em sua região com discrição e
            contato prático.
          </strong>
        </div>
        <div className="lounge-map-hero-art" aria-hidden="true" />
      </section>

      <section className="lounge-mobile-premium" aria-label="Clínicas premium">
        <PremiumClinicCarousel clinics={premiumClinics} />
      </section>

      <section id="mapa" className="lounge-map-stage" aria-label="Mapa Lounge">
        <Map
          filterTipo={filters.tipo}
          filterEstado={filterEstado}
          searchTerm={searchTerm}
          loungeFilters={filters}
          onOpenFilters={openFilters}
        />
      </section>

      <FilterDrawer
        open={filterOpen}
        filters={draftFilters}
        onChange={setDraftFilters}
        onClose={() => setFilterOpen(false)}
        onClear={clearFilters}
        onApply={applyFilters}
      />

      <SiteFooter />
    </main>
  );
}

function FilterDrawer({
  open,
  filters,
  onChange,
  onClose,
  onClear,
  onApply,
}: {
  open: boolean;
  filters: LoungeFilterState;
  onChange: (filters: LoungeFilterState) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}) {
  if (!open) {
    return null;
  }

  function update<K extends keyof LoungeFilterState>(
    key: K,
    value: LoungeFilterState[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="lounge-filter-backdrop" role="presentation">
      <aside
        className="lounge-filter-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Filtros do Lounge"
      >
        <header className="lounge-filter-header">
          <h2>Filtrar</h2>
          <button type="button" onClick={onClose} aria-label="Fechar filtros">
            <X size={25} />
          </button>
        </header>

        <FilterSection label="Status">
          <div className="lounge-filter-segment three">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filters.status === option.value ? "is-active" : ""}
                onClick={() => update("status", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={<Home size={21} />} label="Tipo">
          <div className="lounge-filter-segment type-grid">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filters.tipo === option.value ? "is-active" : ""}
                onClick={() => update("tipo", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={<Star size={21} fill="currentColor" />} label="Nota">
          <div className="lounge-filter-value">
            {filters.minRating <= 0
              ? "Todas as notas"
              : `A partir de ${filters.minRating.toFixed(1)}`}
          </div>
          <input
            className="lounge-filter-range"
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={filters.minRating}
            onChange={(event) =>
              update("minRating", Number(event.target.value))
            }
          />
          <div className="lounge-filter-scale">
            <span>0 estrela</span>
            <span>5 estrelas</span>
          </div>
        </FilterSection>

        <FilterSection icon={<CircleDollarSign size={22} />} label="Valor">
          <div className="lounge-filter-value">
            {filters.maxPrice >= 1000
              ? "Todos os valores"
              : `Até R$ ${filters.maxPrice}`}
          </div>
          <input
            className="lounge-filter-range"
            type="range"
            min={0}
            max={1000}
            step={50}
            value={filters.maxPrice}
            onChange={(event) =>
              update("maxPrice", Number(event.target.value))
            }
          />
          <div className="lounge-filter-scale">
            <span>R$ 0</span>
            <span>R$ 1000</span>
          </div>
        </FilterSection>

        <FilterSection icon={<PlusCircle size={22} />} label="Adicionais">
          <div className="lounge-filter-chip-grid">
            <button
              type="button"
              className={filters.descontoForista ? "is-active" : ""}
              onClick={() =>
                update("descontoForista", !filters.descontoForista)
              }
            >
              Desconto Forista
            </button>
            <button
              type="button"
              className={filters.milhagem ? "is-active" : ""}
              onClick={() => update("milhagem", !filters.milhagem)}
            >
              Milhagem
            </button>
          </div>
        </FilterSection>

        <FilterSection icon={<MapIcon size={22} />} label="Distância">
          <div className="lounge-filter-value">
            {filters.maxDistance >= 100
              ? "Todas as distâncias"
              : `Até ${filters.maxDistance} km`}
          </div>
          <input
            className="lounge-filter-range"
            type="range"
            min={5}
            max={100}
            step={5}
            value={filters.maxDistance}
            onChange={(event) =>
              update("maxDistance", Number(event.target.value))
            }
          />
          <div className="lounge-filter-scale">
            <span>5 km</span>
            <span>Todas</span>
          </div>
        </FilterSection>

        <footer className="lounge-filter-footer">
          <button type="button" className="lounge-filter-clear" onClick={onClear}>
            Limpar
          </button>
          <button type="button" className="lounge-filter-apply" onClick={onApply}>
            Ver resultados
          </button>
        </footer>
      </aside>
    </div>
  );
}

function FilterSection({
  icon,
  label,
  children,
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="lounge-filter-section">
      <div className="lounge-filter-section-title">
        {icon ? <span>{icon}</span> : null}
        <strong>{label}</strong>
        <i />
      </div>
      {children}
    </section>
  );
}

function PremiumClinicCarousel({ clinics }: { clinics: Clinic[] }) {
  const displayClinics = clinics.slice(0, 10);

  if (displayClinics.length === 0) {
    return (
      <div className="lounge-premium-empty">
        Carrossel das clínicas premium
      </div>
    );
  }

  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{ delay: 2600, disableOnInteraction: false }}
      loop={displayClinics.length > 6}
      spaceBetween={12}
      slidesPerView={2.15}
      breakpoints={{
        640: { slidesPerView: 4.25, spaceBetween: 12 },
        980: { slidesPerView: 6.2, spaceBetween: 14 },
      }}
    >
      {displayClinics.map((clinic) => (
        <SwiperSlide key={clinic.id}>
          <Link href={`/lounge/clinicas/${clinic.id}`} className="lounge-premium-mini-card">
            <img
              src={getClinicImage(clinic)}
              alt={clinic.nome}
              onError={(event) => {
                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945";
              }}
            />
            <span>{clinic.nome}</span>
            <small>
              {[clinic.bairro, clinic.cidade].filter(Boolean).join(" - ")}
            </small>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function getClinicImage(clinic: Clinic) {
  const imagens = clinic.imagens;

  try {
    if (Array.isArray(imagens)) {
      return imagens[0] || `/clinicas/${clinic.id}_01.webp`;
    }

    if (typeof imagens === "string" && imagens.trim()) {
      const parsed = JSON.parse(imagens);
      return Array.isArray(parsed)
        ? parsed[0] || `/clinicas/${clinic.id}_01.webp`
        : imagens;
    }
  } catch {
    return `/clinicas/${clinic.id}_01.webp`;
  }

  return `/clinicas/${clinic.id}_01.webp`;
}

function isPromotedClinic(clinic: Clinic) {
  const plano = normalizeText(String(clinic.plano || ""));

  return (
    clinic.privacylog_black === true ||
    plano.includes("premium") ||
    plano.includes("black") ||
    plano.includes("destaque")
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}



