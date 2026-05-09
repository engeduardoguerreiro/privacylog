"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Clinic = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  tipo: string;
  plano: string;
  estado: string;
  cidade: string;
  bairro: string;
  imagens?: unknown;
};

type Props = {
  filterTipo?: string;
  filterEstado?: string;
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
  "Minas Gerais": { lat: -19.9167, lng: -43.9345, zoom: 11 },
  Sul: { lat: -25.4296, lng: -49.2713, zoom: 8 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729, zoom: 11 },
  todos: { lat: -23.5505, lng: -46.6333, zoom: 9 },
};

const stateMap: Record<string, string[]> = {
  "São Paulo": ["SP"],
  "Minas Gerais": ["MG"],
  Sul: ["PR", "SC", "RS"],
  "Rio de Janeiro": ["RJ"],
};

export default function Map({
  filterTipo = "todos",
  filterEstado = "todos",
}: Props) {
  const router = useRouter();
  const [locais, setLocais] = useState<Clinic[]>([]);
  const [selected, setSelected] = useState<Clinic | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
      "AIzaSyAtPbsJ8C-JMnHZKnPqNAe6NDvRs4MmbCg",
  });

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("clinicas").select("*");

      if (error) {
        console.error(error);
        return;
      }

      setLocais(data || []);
    }

    fetchData();
  }, []);

  const currentRegion = regionCenter[filterEstado] || regionCenter.todos;
  const filtered = locais.filter((clinic) => {
    if (filterTipo !== "todos" && clinic.tipo !== filterTipo) {
      return false;
    }

    if (filterEstado !== "todos") {
      const allowedStates = stateMap[filterEstado] || [];

      if (allowedStates.length > 0 && !allowedStates.includes(clinic.estado)) {
        return false;
      }
    }

    return true;
  });
  const selectedImage = selected ? getClinicImage(selected.imagens) : null;

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
    <div className="relative h-full w-full">
      <GoogleMap
        zoom={currentRegion.zoom}
        center={{ lat: currentRegion.lat, lng: currentRegion.lng }}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        }}
        onClick={() => setSelected(null)}
      >
        {filtered.map((local) => (
          <Marker
            key={local.id}
            position={{ lat: Number(local.lat), lng: Number(local.lng) }}
            icon={getPinIcon(local)}
            onClick={() => setSelected(local)}
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

            <h3 className="text-lg font-black text-white">{selected.nome}</h3>
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

function getTypeLabel(tipo: string) {
  const labels: Record<string, string> = {
    clinica: "Clínica",
    massagem: "Massagem",
    boate: "Boate",
    prive: "Privê",
  };

  return labels[tipo] || "Local";
}

function getClinicImage(imagens: unknown): string | null {
  try {
    if (Array.isArray(imagens)) {
      return imagens[0] || null;
    }

    if (typeof imagens === "string") {
      try {
        const parsed = JSON.parse(imagens);

        if (Array.isArray(parsed)) {
          return parsed[0] || null;
        }

        return imagens;
      } catch {
        return imagens;
      }
    }

    return null;
  } catch {
    return null;
  }
}
