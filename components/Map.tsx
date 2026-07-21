"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { ChevronDown, ChevronUp, SlidersHorizontal, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Clinic = {
  id: number;
  nome: string;
  lat: number | string | null;
  lng: number | string | null;
  tipo: string;
  plano: string;
  endereco?: string | null;
  estado: string;
  cidade: string;
  bairro: string;
  imagens?: unknown;
  horarios?: unknown;
  preco_30_forista?: number | string | null;
  preco_60_normal?: number | string | null;
  preco_60_forista?: number | string | null;
};

type LoungeMapFilters = {
  status?: "todos" | "abertos" | "fechados";
  minRating?: number;
  maxPrice?: number;
  descontoForista?: boolean;
  milhagem?: boolean;
  maxDistance?: number;
};

type Props = {
  filterTipo?: string;
  filterEstado?: string;
  searchTerm?: string;
  loungeFilters?: LoungeMapFilters;
  onOpenFilters?: () => void;
};

type TopicRating = {
  clinic_id: number | null;
  nota: number | string | null;
};

type RatingSummary = {
  average: number;
  count: number;
};

type MapViewport = {
  center: { lat: number; lng: number };
  zoom: number;
};

const loungeMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#fff8f0" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6d5a78" }] },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#fffaf4" }, { weight: 2 }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#ead7c4" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b2378" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#fff4ec" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#f3e6ef" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#f2dcae" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a7895" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#efe3ff" }],
  },
];

const saoPauloViewport = { lat: -23.58158, lng: -46.65232, zoom: 12 };

const regionCenter: Record<string, { lat: number; lng: number; zoom: number }> = {
  SP: saoPauloViewport,
  MG: { lat: -19.9167, lng: -43.9345, zoom: 11 },
  RJ: { lat: -22.9068, lng: -43.1729, zoom: 11 },
  SUL: { lat: -25.4296, lng: -49.2713, zoom: 8 },
  todos: saoPauloViewport,
};

const stateMap: Record<string, string[]> = {
  SP: ["SP"],
  MG: ["MG"],
  RJ: ["RJ"],
  SUL: ["PR", "SC", "RS"],
};

const fallbackMapImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945";

const defaultLoungeFilters: Required<LoungeMapFilters> = {
  status: "todos",
  minRating: 0,
  maxPrice: 1000,
  descontoForista: false,
  milhagem: false,
  maxDistance: 100,
};
const userLocationCameraRadiusKm = 35;

export default function Map({
  filterTipo = "todos",
  filterEstado = "todos",
  searchTerm = "",
  loungeFilters,
  onOpenFilters,
}: Props) {
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [locais, setLocais] = useState<Clinic[]>([]);
  const [selected, setSelected] = useState<Clinic | null>(null);
  const [focusedViewport, setFocusedViewport] = useState<MapViewport | null>(
    null
  );
  const [userViewport, setUserViewport] = useState<MapViewport | null>(null);
  const [ratingsByClinic, setRatingsByClinic] = useState<
    Record<number, RatingSummary>
  >({});
  const [listSort, setListSort] = useState("nome");
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const activeFilters = useMemo(
    () => ({ ...defaultLoungeFilters, ...loungeFilters }),
    [loungeFilters]
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
      "AIzaSyAtPbsJ8C-JMnHZKnPqNAe6NDvRs4MmbCg",
  });

  useEffect(() => {
    async function fetchData() {
      const [clinicsResult, ratingsResult] = await Promise.all([
        supabase
          .from("clinicas")
          .select(
            "id,nome,lat,lng,tipo,plano,endereco,bairro,cidade,estado,imagens,horarios,preco_30_forista,preco_60_normal,preco_60_forista"
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

  useEffect(() => {
    let cancelled = false;

    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) {
          return;
        }

        setUserViewport({
          center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          zoom: 13,
        });
      },
      () => {
        if (cancelled) {
          return;
        }

        setUserViewport(null);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 5000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const currentRegion = regionCenter[filterEstado] || regionCenter.SP;

  const regionViewport = useMemo<MapViewport>(
    () => ({
      center: { lat: currentRegion.lat, lng: currentRegion.lng },
      zoom: currentRegion.zoom,
    }),
    [currentRegion.lat, currentRegion.lng, currentRegion.zoom]
  );

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return locais.filter((clinic) => {
      if (filterTipo !== "todos" && clinic.tipo !== filterTipo) {
        return false;
      }

      if (activeFilters.status === "abertos" && !isClinicOpen(clinic)) {
        return false;
      }

      if (activeFilters.status === "fechados" && isClinicOpen(clinic)) {
        return false;
      }

      if (activeFilters.minRating > 0) {
        const rating = ratingsByClinic[clinic.id]?.average;

        if (!rating || rating < activeFilters.minRating) {
          return false;
        }
      }

      if (activeFilters.maxPrice < 1000) {
        const price = getOneHourPriceNumber(clinic);

        if (price > activeFilters.maxPrice) {
          return false;
        }
      }

      if (activeFilters.descontoForista && !hasForistaDiscount(clinic)) {
        return false;
      }

      if (userViewport && activeFilters.maxDistance < 100) {
        const position = getClinicPosition(clinic);

        if (
          !position ||
          getDistanceInKm(userViewport.center, position) >
            activeFilters.maxDistance
        ) {
          return false;
        }
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
  }, [
    activeFilters,
    filterEstado,
    filterTipo,
    locais,
    ratingsByClinic,
    searchTerm,
    userViewport,
  ]);

  const selectedIsVisible = selected
    ? filtered.some((clinic) => clinic.id === selected.id)
    : false;
  const activeSelected = selectedIsVisible ? selected : null;
  const normalizedRegion = normalizeText(filterEstado);
  const isDefaultBrowsingState =
    !selectedIsVisible &&
    !searchTerm.trim() &&
    filterTipo === "todos" &&
    areDefaultMapFilters(activeFilters) &&
    (normalizedRegion === "sp" ||
      normalizedRegion === "todos" ||
      normalizedRegion.includes("sao paulo"));
  const viewportClinics = useMemo(
    () => getViewportClinics(filtered, filterEstado),
    [filtered, filterEstado]
  );

  const shouldUseUserLocation =
    isDefaultBrowsingState &&
    Boolean(userViewport) &&
    hasNearbyClinic(filtered, userViewport?.center, userLocationCameraRadiusKm);
  const shouldUseCapitalDefault =
    isDefaultBrowsingState && !shouldUseUserLocation;

  const dataViewport = useMemo<MapViewport>(() => {
    if (shouldUseUserLocation && userViewport) {
      return userViewport;
    }

    if (shouldUseCapitalDefault) {
      return regionViewport;
    }

    if (viewportClinics.length === 0) {
      return regionViewport;
    }

    return buildViewportFromClinics(viewportClinics, regionViewport);
  }, [
    regionViewport,
    shouldUseCapitalDefault,
    shouldUseUserLocation,
    userViewport,
    viewportClinics,
  ]);

  const activeFocusedViewport = selectedIsVisible ? focusedViewport : null;
  const mapViewport = activeFocusedViewport || dataViewport;

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (activeFocusedViewport) {
      focusMapViewport(map, activeFocusedViewport);
      const timers = [120, 360].map((delay) =>
        window.setTimeout(
          () => focusMapViewport(map, activeFocusedViewport),
          delay
        )
      );

      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }

    applyMapViewport(map, mapViewport);
  }, [activeFocusedViewport, mapViewport]);

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

  const selectedImage = activeSelected ? getClinicImage(activeSelected) : null;

  function focusClinic(clinic: Clinic) {
    setSelected(clinic);

    const position = getClinicPosition(clinic);

    if (position && mapRef.current) {
      const viewport = { center: position, zoom: 16 };

      setFocusedViewport(viewport);
      focusMapViewport(mapRef.current, viewport);
      window.requestAnimationFrame(() => {
        if (mapRef.current) {
          focusMapViewport(mapRef.current, viewport);
        }
      });
      window.setTimeout(() => {
        if (mapRef.current) {
          focusMapViewport(mapRef.current, viewport);
        }
      }, 320);

      return;
    }

    if (position) {
      setFocusedViewport({
        center: position,
        zoom: 16,
      });
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
        {onOpenFilters ? (
          <button
            className="map-filter-floating"
            type="button"
            onClick={onOpenFilters}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal size={22} />
            Filtrar
          </button>
        ) : null}

        <GoogleMap
          zoom={mapViewport.zoom}
          center={mapViewport.center}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            styles: loungeMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            gestureHandling: "cooperative",
            scrollwheel: false,
          }}
          onClick={() => setSelected(null)}
          onLoad={(map) => {
            mapRef.current = map;
            applyMapViewport(map, mapViewport);
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
        >
          {filtered.map((local) => {
            const position = getClinicPosition(local);

            if (!position) {
              return null;
            }

            return (
              <Marker
                key={local.id}
                position={position}
                icon={getPinIcon(local)}
                onClick={() => focusClinic(local)}
              />
            );
          })}
        </GoogleMap>

        {activeSelected ? (
          <aside className="map-detail-card">
            <div className="map-detail-image h-36 w-full bg-[#10101c]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={activeSelected.nome}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    if (event.currentTarget.src !== fallbackMapImage) {
                      event.currentTarget.src = fallbackMapImage;
                    }
                  }}
                />
              ) : null}
            </div>

            <div className="map-detail-body p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {(activeSelected.plano || "").toLowerCase() === "premium" ? (
                  <span className="privacy-badge badge-premium">Premium</span>
                ) : null}
                <span className={`privacy-badge ${getBadgeClass(activeSelected)}`}>
                  {getTypeLabel(activeSelected.tipo)}
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {activeSelected.nome}
              </h3>
              <p className="mt-2 text-sm text-[#b8b8c8]">
                {activeSelected.bairro} - {activeSelected.cidade}
              </p>

              <button
                onClick={() =>
                  router.push(`/lounge/clinicas/${activeSelected.id}`)
                }
                className="primary-button map-detail-action mt-5 w-full"
                type="button"
              >
                Ver detalhes
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      <aside
        className={`location-list-panel ${isListCollapsed ? "is-collapsed" : ""}`}
        aria-label="Lista de locais"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="location-list-toggle"
          aria-expanded={!isListCollapsed}
          onClick={() => setIsListCollapsed((value) => !value)}
        >
          <span className="location-list-handle" aria-hidden="true" />
          <span>{isListCollapsed ? "Mostrar lista" : "Minimizar lista"}</span>
          {isListCollapsed ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>

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

        <div
          className="location-list-table-wrap"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
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
                      onClick={() => {
                        focusClinic(local);
                        setIsListCollapsed(true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          focusClinic(local);
                          setIsListCollapsed(true);
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

function getClinicPosition(clinic: Clinic) {
  const lat = Number(clinic.lat);
  const lng = Number(clinic.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) < 1 ||
    Math.abs(lng) < 1
  ) {
    return null;
  }

  return { lat, lng };
}

function getViewportClinics(clinics: Clinic[], filterEstado: string) {
  const withPosition = clinics.filter((clinic) => getClinicPosition(clinic));

  if (filterEstado === "SP" || filterEstado === "todos") {
    const saoPauloCapital = withPosition.filter(
      (clinic) =>
        normalizeText(clinic.estado || "") === "sp" &&
        normalizeText(clinic.cidade || "").includes("sao paulo")
    );

    if (saoPauloCapital.length > 0) {
      return saoPauloCapital;
    }
  }

  return withPosition;
}

function buildViewportFromClinics(
  clinics: Clinic[],
  fallbackViewport: MapViewport
): MapViewport {
  const positions = clinics
    .map((clinic) => getClinicPosition(clinic))
    .filter(Boolean) as Array<{ lat: number; lng: number }>;

  if (positions.length === 0) {
    return fallbackViewport;
  }

  const totals = positions.reduce(
    (acc, position) => ({
      lat: acc.lat + position.lat,
      lng: acc.lng + position.lng,
    }),
    { lat: 0, lng: 0 }
  );
  const lats = positions.map((position) => position.lat);
  const lngs = positions.map((position) => position.lng);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const largestSpan = Math.max(latSpan, lngSpan);

  return {
    center: {
      lat: totals.lat / positions.length,
      lng: totals.lng / positions.length,
    },
    zoom: getZoomForSpan(largestSpan, fallbackViewport.zoom),
  };
}

function getZoomForSpan(span: number, fallbackZoom: number) {
  if (!Number.isFinite(span) || span <= 0.01) {
    return 14;
  }

  if (span <= 0.12) {
    return 13;
  }

  if (span <= 0.32) {
    return 12;
  }

  if (span <= 0.7) {
    return 11;
  }

  if (span <= 1.4) {
    return 10;
  }

  return Math.min(fallbackZoom, 9);
}

function areDefaultMapFilters(filters: Required<LoungeMapFilters>) {
  return (
    filters.status === "todos" &&
    filters.minRating === 0 &&
    filters.maxPrice >= 1000 &&
    !filters.descontoForista &&
    !filters.milhagem &&
    filters.maxDistance >= 100
  );
}

function applyMapViewport(map: google.maps.Map, viewport: MapViewport) {
  map.moveCamera?.({
    center: viewport.center,
    zoom: viewport.zoom,
  });
  map.setCenter(viewport.center);
  map.setZoom(viewport.zoom);
}

function focusMapViewport(map: google.maps.Map, viewport: MapViewport) {
  map.moveCamera?.({
    center: viewport.center,
    zoom: viewport.zoom,
  });
  map.setCenter(viewport.center);
  map.setZoom(viewport.zoom);
  map.panTo(viewport.center);
}

function getDistanceInKm(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function hasNearbyClinic(
  clinics: Clinic[],
  center: { lat: number; lng: number } | undefined,
  radiusKm: number
) {
  if (!center) {
    return false;
  }

  return clinics.some((clinic) => {
    const position = getClinicPosition(clinic);

    return position
      ? getDistanceInKm(center, position) <= radiusKm
      : false;
  });
}

function isClinicOpen(clinic: Clinic) {
  const horarios = parseOpeningHours(clinic.horarios);

  if (!horarios) {
    return false;
  }

  const now = new Date();
  const day = now.getDay();
  const scheduleKey = day === 0 ? "sunday" : day === 6 ? "saturday" : "weekday";
  const slots = horarios[scheduleKey] || [];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.some((slot) => {
    const open = parseTimeToMinutes(slot.open);
    const close = parseTimeToMinutes(slot.close);

    if (open === null || close === null) {
      return false;
    }

    if (close <= open) {
      return currentMinutes >= open || currentMinutes <= close;
    }

    return currentMinutes >= open && currentMinutes <= close;
  });
}

function parseOpeningHours(value: unknown) {
  const parsedValue = typeof value === "string" ? safeJsonParse(value) : value;

  if (!parsedValue || typeof parsedValue !== "object") {
    return null;
  }

  return parsedValue as Record<
    "weekday" | "saturday" | "sunday",
    Array<{ open?: string; close?: string }>
  >;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseTimeToMinutes(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function hasForistaDiscount(clinic: Clinic) {
  return (
    toPositiveNumber(clinic.preco_30_forista) > 0 ||
    toPositiveNumber(clinic.preco_60_forista) > 0
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
    predio: "Prédio",
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
  const value =
    toPositiveNumber(clinic.preco_60_forista) ||
    toPositiveNumber(clinic.preco_60_normal);

  return Number.isFinite(value) && value > 0 ? value : Number.MAX_SAFE_INTEGER;
}

function toPositiveNumber(value: number | string | null | undefined) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
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
