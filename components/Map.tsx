"use client";

import {
  GoogleMap,
  useLoadScript,
  Marker,
} from "@react-google-maps/api";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Clinic = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  tipo: string;
  estado: string;
  cidade: string;
  bairro: string;
  imagens?: any;
};

type Props = {
  filterTipo?: string;
  filterEstado?: string;
};

/* ───────────────────────────────────────────── */
/* MAPA DARK PREMIUM CLEAN */
/* ───────────────────────────────────────────── */

const darkMapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#0b0b12" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f6f85" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "off" }],
  },

  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },

  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },

  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1a24" }],
  },

  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#222235" }],
  },

  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f4f63" }],
  },

  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#090910" }],
  },

  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },

  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9a9ab0" }],
  },

  {
    featureType: "landscape",
    stylers: [{ color: "#0b0b12" }],
  },
];

/* ───────────────────────────────────────────── */
/* REGIÕES */
/* ───────────────────────────────────────────── */

const regionCenter: Record<
  string,
  { lat: number; lng: number; zoom: number }
> = {
  "São Paulo": {
    lat: -23.5505,
    lng: -46.6333,
    zoom: 11,
  },

  "Minas Gerais": {
    lat: -19.9167,
    lng: -43.9345,
    zoom: 11,
  },

  Sul: {
    lat: -25.4296,
    lng: -49.2713,
    zoom: 10,
  },

  "Rio de Janeiro": {
    lat: -22.9068,
    lng: -43.1729,
    zoom: 11,
  },

  todos: {
    lat: -23.5505,
    lng: -46.6333,
    zoom: 10,
  },
};

/* ───────────────────────────────────────────── */
/* COMPONENTE */
/* ───────────────────────────────────────────── */

export default function Map({
  filterTipo = "todos",
  filterEstado = "todos",
}: Props) {
  const router = useRouter();

  const [locais, setLocais] = useState<Clinic[]>([]);
  const [selected, setSelected] = useState<Clinic | null>(null);

  const [mapCenter, setMapCenter] = useState({
    lat: -23.5505,
    lng: -46.6333,
  });

  const [mapZoom, setMapZoom] = useState(11);

  /* ───────────────────────────────────────────── */
  /* GOOGLE MAPS */
  /* ───────────────────────────────────────────── */

  const { isLoaded } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
      "AIzaSyAtPbsJ8C-JMnHZKnPqNAe6NDvRs4MmbCg",
  });

  /* ───────────────────────────────────────────── */
  /* SUPABASE */
  /* ───────────────────────────────────────────── */

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("clinicas")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      console.log("Dados carregados:", data);

      setLocais(data || []);
    }

    fetchData();
  }, []);

  /* ───────────────────────────────────────────── */
  /* REGIÕES */
  /* ───────────────────────────────────────────── */

  useEffect(() => {
    const center =
      regionCenter[filterEstado] ||
      regionCenter["São Paulo"];

    setMapCenter({
      lat: center.lat,
      lng: center.lng,
    });

    setMapZoom(center.zoom);
  }, [filterEstado]);

  /* ───────────────────────────────────────────── */
  /* FILTROS */
  /* ───────────────────────────────────────────── */

  function applyFilters(list: Clinic[]) {
    return list.filter((c) => {
      if (
        filterTipo !== "todos" &&
        c.tipo !== filterTipo
      ) {
        return false;
      }

      if (filterEstado !== "todos") {
        const stateMap: Record<
          string,
          string[]
        > = {
          "São Paulo": ["SP"],
          "Minas Gerais": ["MG"],
          Sul: ["PR", "SC", "RS"],
          "Rio de Janeiro": ["RJ"],
        };

        const allowed =
          stateMap[filterEstado] || [];

        if (
          allowed.length > 0 &&
          !allowed.includes(c.estado)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  const filtered = applyFilters(locais);

  /* ───────────────────────────────────────────── */
  /* PIN CUSTOM */
  /* ───────────────────────────────────────────── */

  function getPinIcon(clinic: Clinic) {
    if (clinic.tipo === "premium") {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="#F4C542">
        <path d="M12 2L14.9 8.6L22 9.2L16.8 13.8L18.4 21L12 17.2L5.6 21L7.2 13.8L2 9.2L9.1 8.6L12 2Z"/>
      </svg>
      `;

      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          svg
        )}`,
        scaledSize: new google.maps.Size(
          38,
          38
        ),
      };
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#8B5CF6">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        svg
      )}`,
      scaledSize: new google.maps.Size(
        34,
        34
      ),
    };
  }

  /* ───────────────────────────────────────────── */
  /* IMAGEM CLINICA */
  /* ───────────────────────────────────────────── */

  function getClinicImage(
    imagens: any
  ): string | null {
    try {
      // ARRAY
      if (Array.isArray(imagens)) {
        const image101 = imagens.find(
          (img: string) =>
            typeof img === "string" &&
            img.includes("1_01")
        );

        return (
          image101 ||
          imagens[0] ||
          null
        );
      }

      // STRING JSON
      if (typeof imagens === "string") {
        try {
          const parsed =
            JSON.parse(imagens);

          if (Array.isArray(parsed)) {
            const image101 =
              parsed.find(
                (img: string) =>
                  typeof img ===
                    "string" &&
                  img.includes("1_01")
              );

            return (
              image101 ||
              parsed[0] ||
              null
            );
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

  /* ───────────────────────────────────────────── */
  /* LOADING */
  /* ───────────────────────────────────────────── */

  if (!isLoaded) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0b12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
        }}
      >
        Carregando mapa...
      </div>
    );
  }

  /* ───────────────────────────────────────────── */
  /* JSX */
  /* ───────────────────────────────────────────── */

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <GoogleMap
        zoom={mapZoom}
        center={mapCenter}
        mapContainerStyle={{
          width: "100%",
          height: "100%",
        }}
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
            position={{
              lat: Number(local.lat),
              lng: Number(local.lng),
            }}
            icon={getPinIcon(local)}
            onClick={() =>
              setSelected(local)
            }
          />
        ))}
      </GoogleMap>

      {/* POPUP */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            width: 260,

            background:
              "rgba(10,10,18,0.95)",

            border:
              "1px solid rgba(255,255,255,0.08)",

            borderRadius: 18,

            overflow: "hidden",

            boxShadow:
              "0 25px 80px rgba(0,0,0,0.7)",

            backdropFilter: "blur(20px)",

            zIndex: 20,
          }}
        >
          {/* IMAGEM */}
          <div
            style={{
              width: "100%",
              height: 140,
              background: "#12121a",
            }}
          >
            {getClinicImage(
              selected.imagens
            ) && (
              <img
                src={
                  getClinicImage(
                    selected.imagens
                  ) || ""
                }
                alt={selected.nome}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* BODY */}
          <div
            style={{
              padding: 18,
            }}
          >
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 6,
              }}
            >
              {selected.nome}
            </div>

            <div
              style={{
                color: "#8a8aa3",
                fontSize: 14,
                marginBottom: 14,
              }}
            >
              {selected.bairro} ·{" "}
              {selected.cidade}
            </div>

            <button
              onClick={() =>
                router.push(
                  `/clinica/${selected.id}`
                )
              }
              style={{
                width: "100%",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",

                background:
                  "linear-gradient(135deg,#7C5CFF,#A855F7)",

                color: "#fff",

                fontWeight: 700,

                fontSize: 14,
              }}
            >
              Ver detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}