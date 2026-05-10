"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Clinic = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  tipo: string;
  plano: string;
  endereco?: string | null;
  estado: string;
  cidade: string;
  bairro: string;
  imagens?: unknown;
  preco_60_normal?: number | string | null;
  preco_60_forista?: number | string | null;
};

type Props = {
  filterTipo?: string;
  filterEstado?: string;
  searchTerm?: string;
};

type TopicRating = {
  clinic_id: number | null;
  nota: number | string | null;
};

type RatingSummary = {
  average: number;
  count: number;
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0b0b12" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#85859a" }] },
  { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1b1b2f" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#252542" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#696980" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#070711" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b8b8c8" }],
  },
  { featureType: "landscape", stylers: [{ color: "#0b0b12" }] },
];

const regionCenter: Record<string, { lat: number; lng: number; zoom: number }> = {
  "São Paulo": { lat: -23.5505, lng: -46.6333, zoom: 11 },
  "SÃ£o Paulo": { lat: -23.5505, lng: -46.6333, zoom: 11 },
  "Minas Gerais": { lat: -19.9167, lng: -43.9345, zoom: 11 },
  Sul: { lat: -25.4296, lng: -49.2713, zoom: 8 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729, zoom: 11 },
  todos: { lat: -23.5505, lng: -46.6333, zoom: 9 },
};

const stateMap: Record<string, string[]> = {
  "São Paulo": ["SP"],
  "SÃ£o Paulo": ["SP"],
  "Minas Gerais": ["MG"],
  Sul: ["PR", "SC", "RS"],
  "Rio de Janeiro": ["RJ"],
};

const fallbackMapImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945";

export default function Map({
  filterTipo = "todos",
  filterEstado = "todos",
  searchTerm = "",
}: Props) {
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [locais, setLocais] = useState<Clinic[]>([]);
  const [selected, setSelected] = useState<Clinic | null>(null);
  const [ratingsByClinic, setRatingsByClinic] = useState<
    Record<number, RatingSummary>
  >({});
  const [listSort, setListSort] = useState("nome");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
      "AIzaSyAtPbsJ8C-JMnHZKnPqNAe6NDvRs4MmbCg",
  });

  useEffect(() => {
    async function fetchData() {
      const [clinicsResult, ratingsResult] = await Promise.all([
        supabase
          .from("clinicas")
          .select(
            "id,nome,lat,lng,tipo,plano,endereco,bairro,cidade,estado,imagens,preco_60_normal,preco_60_forista"
          ),
        supabase
          .from("forum_topics")
          .select("clinic_id, nota")
          .not("clinic_id", "is", null)
          .not("nota", "is", null)
          .eq("oculto", false),
      ]);

      if (clinicsResult.error) {
        console.error(clinicsResult.error);
        return;
      }

      if (ratingsResult.error) {
        console.error(ratingsResult.error);
      }

      setLocais(clinicsResult.data || []);
      setRatingsByClinic(
        buildRatingsByClinic((ratingsResult.data || []) as TopicRating[])
      );
    }

    fetchData();
  }, []);

  const currentRegion = regionCenter[filterEstado] || regionCenter.todos;
  const filtered = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return locais.filter((clinic) => {
      if (filterTipo !== "todos" && clinic.tipo !== filterTipo) {
        return false;
      }

      if (filterEstado !== "todos") {
        const allowedStates = stateMap[filterEstado] || [];

        if (
          allowedStates.length > 0 &&
          !allowedStates.includes(clinic.estado)
        ) {
          return false;
        }
      }

      if (normalizedSearch) {
        const searchableText = normalizeText(
          [
            clinic.nome,
            clinic.endereco,
            clinic.bairro,
            clinic.cidade,
            clinic.estado,
            getTypeLabel(clinic.tipo),
          ]
            .filter(Boolean)
            .join(" ")
        );

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [filterEstado, filterTipo, locais, searchTerm]);

  const listedLocais = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (listSort === "avaliacao") {
        const ratingA = ratingsByClinic[a.id]?.average ?? -1;
        const ratingB = ratingsByClinic[b.id]?.average ?? -1;

        return ratingB - ratingA || a.nome.localeCompare(b.nome, "pt-BR");
      }

      if (listSort === "valor") {
        const priceA = getOneHourPriceNumber(a);
        const priceB = getOneHourPriceNumber(b);

        return priceA - priceB || a.nome.localeCompare(b.nome, "pt-BR");
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [filtered, listSort, ratingsByClinic]);

  const selectedImage = selected ? getClinicImage(selected) : null;

  function focusClinic(clinic: Clinic) {
    setSelected(clinic);

    if (clinic.lat && clinic.lng && mapRef.current) {
      const position = { lat: Number(clinic.lat), lng: Number(clinic.lng) };

      mapRef.current.panTo(position);

      if ((mapRef.current.getZoom() || 0) < 14) {
        mapRef.current.setZoom(14);
      }
    }
  }

  function getPinIcon(clinic: Clinic) {
    const premium = (clinic.plano || "").toLowerCase() === "premium";
    const color = getPinColor(clinic);
    const glow = premium ? "rgba(246,196,83,0.75)" : `${color}99`;
    const svg = premium
      ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${glow}"/>
            </filter>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <stop stop-color="#f8df8c"/>
              <stop offset="0.55" stop-color="#f6c453"/>
              <stop offset="1" stop-color="#9f6a18"/>
            </linearGradient>
          </defs>
          <path filter="url(#glow)" fill="url(#gold)" d="M23 3l5.5 12.2 13.2 1.2-10 8.8 3 13.1L23 31.5 11.3 38.3l3-13.1-10-8.8 13.2-1.2L23 3z"/>
          <circle cx="23" cy="22" r="4" fill="#111"/>
        </svg>`
      : `
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${glow}"/>
            </filter>
            <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1">
              <stop stop-color="${color}"/>
              <stop offset="1" stop-color="#4c1d95"/>
            </linearGradient>
          </defs>
          <path filter="url(#glow)" d="M21 3c-6.9 0-12.5 5.5-12.5 12.4 0 9.1 12.5 23.6 12.5 23.6s12.5-14.5 12.5-23.6C33.5 8.5 27.9 3 21 3z" fill="url(#pin)"/>
          <circle cx="21" cy="15.5" r="4.2" fill="#fff"/>
        </svg>`;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(premium ? 42 : 36, premium ? 42 : 36),
    };
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#10101c] text-[#85859a]">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="map-explorer">
      <div className="map-canvas-area">
        <GoogleMap
          zoom={currentRegion.zoom}
          center={{ lat: currentRegion.lat, lng: currentRegion.lng }}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            gestureHandling: "greedy",
            scrollwheel: true,
          }}
          onClick={() => setSelected(null)}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
        >
          {filtered.map((local) => (
            <Marker
              key={local.id}
              position={{ lat: Number(local.lat), lng: Number(local.lng) }}
              icon={getPinIcon(local)}
              onClick={() => focusClinic(local)}
            />
          ))}
        </GoogleMap>

        {selected ? (
          <aside className="map-detail-card">
            <div className="h-36 w-full bg-[#10101c]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={selected.nome}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    if (event.currentTarget.src !== fallbackMapImage) {
                      event.currentTarget.src = fallbackMapImage;
                    }
                  }}
                />
              ) : null}
            </div>

            <div className="p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {(selected.plano || "").toLowerCase() === "premium" ? (
                  <span className="privacy-badge badge-premium">Premium</span>
                ) : null}
                <span className={`privacy-badge ${getBadgeClass(selected)}`}>
                  {getTypeLabel(selected.tipo)}
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {selected.nome}
              </h3>
              <p className="mt-2 text-sm text-[#b8b8c8]">
                {selected.bairro} · {selected.cidade}
              </p>

              <button
                onClick={() => router.push(`/clinica/${selected.id}`)}
                className="primary-button mt-5 w-full"
                type="button"
              >
                Ver detalhes
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      <aside className="location-list-panel" aria-label="Lista de locais">
        <div className="location-list-handle" aria-hidden="true" />

        <div className="location-list-header">
          <div>
            <span className="location-list-kicker">Lista de locais</span>
            <h2>Locais encontrados</h2>
            <p>{listedLocais.length} locais no filtro atual</p>
          </div>

          <label className="location-list-sort">
            <span>Ordenar</span>
            <select
              value={listSort}
              onChange={(event) => setListSort(event.target.value)}
            >
              <option value="nome">Nome</option>
              <option value="avaliacao">Avaliação</option>
              <option value="valor">Valor 1h</option>
            </select>
          </label>
        </div>

        <div className="location-list-table-wrap">
          <table className="location-list-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nome</th>
                <th>Avaliação</th>
                <th>1 Hora</th>
              </tr>
            </thead>
            <tbody>
              {listedLocais.length > 0 ? (
                listedLocais.map((local) => {
                  const rating = ratingsByClinic[local.id];
                  const isSelected = selected?.id === local.id;

                  return (
                    <tr
                      key={local.id}
                      className={isSelected ? "is-selected" : undefined}
                      onClick={() => focusClinic(local)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          focusClinic(local);
                        }
                      }}
                      tabIndex={0}
                    >
                      <td>
                        <span
                          className={`location-type-pill ${getListBadgeClass(
                            local
                          )}`}
                        >
                          {getTypeLabel(local.tipo)}
                        </span>
                      </td>
                      <td>
                        <strong>{local.nome}</strong>
                        <small>
                          {[local.bairro, local.cidade]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </td>
                      <td>
                        {rating ? (
                          <span className="location-rating">
                            {rating.average.toFixed(2)}
                            <Star size={12} fill="currentColor" />
                          </span>
                        ) : (
                          <span className="location-muted">---</span>
                        )}
                      </td>
                      <td>
                        <span className="location-price">
                          {formatOneHourPrice(local)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="location-empty">
                      Nenhum local encontrado para esses filtros.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
}

function getPinColor(clinic: Clinic) {
  if ((clinic.plano || "").toLowerCase() === "premium") {
    return "#f6c453";
  }

  if (clinic.tipo === "clinica") {
    return "#38bdf8";
  }

  if (clinic.tipo === "prive" || clinic.tipo === "boate") {
    return "#ec4899";
  }

  return "#8b5cf6";
}

function getBadgeClass(clinic: Clinic) {
  if (clinic.tipo === "clinica") {
    return "badge-blue";
  }

  if (clinic.tipo === "prive" || clinic.tipo === "boate") {
    return "badge-pink";
  }

  return "badge-purple";
}

function getListBadgeClass(clinic: Clinic) {
  if ((clinic.plano || "").toLowerCase() === "premium") {
    return "is-premium";
  }

  if (clinic.tipo === "clinica") {
    return "is-blue";
  }

  if (clinic.tipo === "prive" || clinic.tipo === "boate") {
    return "is-pink";
  }

  return "is-purple";
}

function getTypeLabel(tipo: string) {
  const labels: Record<string, string> = {
    clinica: "Clínica",
    massagem: "Massagem",
    boate: "Boate",
    prive: "Privê",
    acompanhante: "Freelancer",
    freelancer: "Freelancer",
    swing: "Swing",
  };

  return labels[tipo] || "Local";
}

function buildRatingsByClinic(rows: TopicRating[]) {
  const totals: Record<number, { sum: number; count: number }> = {};

  rows.forEach((row) => {
    const clinicId = row.clinic_id;
    const value = Number(row.nota);

    if (!clinicId || Number.isNaN(value)) {
      return;
    }

    totals[clinicId] ||= { sum: 0, count: 0 };
    totals[clinicId].sum += value;
    totals[clinicId].count += 1;
  });

  return Object.fromEntries(
    Object.entries(totals).map(([clinicId, total]) => [
      clinicId,
      {
        average: total.sum / total.count,
        count: total.count,
      },
    ])
  ) as Record<number, RatingSummary>;
}

function getOneHourPriceNumber(clinic: Clinic) {
  const price = clinic.preco_60_forista ?? clinic.preco_60_normal;
  const value = Number(price);

  return Number.isFinite(value) && value > 0 ? value : Number.MAX_SAFE_INTEGER;
}

function formatOneHourPrice(clinic: Clinic) {
  const value = getOneHourPriceNumber(clinic);

  if (value === Number.MAX_SAFE_INTEGER) {
    return "---";
  }

  return `R$${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  })}`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getClinicImage(clinic: Clinic): string | null {
  const imagens = clinic.imagens;

  try {
    if (Array.isArray(imagens)) {
      return imagens[0] || `/clinicas/${clinic.id}_01.webp`;
    }

    if (typeof imagens === "string") {
      try {
        const parsed = JSON.parse(imagens);

        if (Array.isArray(parsed)) {
          return parsed[0] || `/clinicas/${clinic.id}_01.webp`;
        }

        return imagens;
      } catch {
        return imagens;
      }
    }

    return `/clinicas/${clinic.id}_01.webp`;
  } catch {
    return `/clinicas/${clinic.id}_01.webp`;
  }
}
