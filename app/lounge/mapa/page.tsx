"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import {
  CircleDollarSign,
  Home,
  MapIcon,
  PlusCircle,
  Search,
  Star,
  X,
} from "lucide-react";
import SiteHeader from "@/app/_home/SiteHeader";
import SiteFooter from "@/app/_home/SiteFooter";
import styles from "./mapa.module.css";

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
  const [filterEstado, setFilterEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LoungeFilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] =
    useState<LoungeFilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

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
    <main className={styles.page}>

      <SiteHeader />

      <section className={styles.hero} aria-label="Apresentação do mapa">
        <div className={styles.container}>
          <span className={styles.kicker}>Mapa PrivacyLog</span>
          <h1 className={styles.title}>
            Encontre clínicas <em>premium</em> no mapa
          </h1>
          <p className={styles.subtitle}>
            Navegue por espaços verificados na sua região, com discrição e
            contato prático.
          </p>

          <form className={styles.search} onSubmit={handleSearch}>
            <Search size={20} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nome ou endereço..."
              aria-label="Buscar por nome ou endereço"
            />
            <button type="submit" className={styles.searchBtn}>
              Buscar
            </button>
          </form>
        </div>
      </section>

      <div className={styles.mapWrap}>
        <section
          id="mapa"
          className={`lounge-map-stage ${styles.stageSkin}`}
          aria-label="Mapa Lounge"
        >
          <Map
            filterTipo={filters.tipo}
            filterEstado={filterEstado}
            searchTerm={searchTerm}
            loungeFilters={filters}
            onOpenFilters={openFilters}
          />
        </section>
      </div>

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



function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}



