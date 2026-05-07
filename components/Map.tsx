"use client";

import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Clinic = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  tipo: string; // premium / clinica / massagem / boate / prive
  estado: string;
  cidade: string;
  bairro: string;
  horarios: any;
};

export default function Map() {
  const router = useRouter();
  const [locais, setLocais] = useState<Clinic[]>([]);

  const [filters, setFilters] = useState({
    status: "todos",
    tipo: "todos",
    estado: "todos",
    cidade: "todos",
    bairro: "todos",
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAtPbsJ8C-JMnHZKnPqNAe6NDvRs4MmbCg",
  });

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("clinicas").select("*");

      if (!error) setLocais(data || []);
      else console.error(error);
    }

    fetchData();
  }, []);

  // 🧠 HORÁRIO
  function isOpenNow(horarios: any) {
    if (!horarios) return false;

    const now = new Date();
    const day = now.getDay();
    const current = now.getHours() * 60 + now.getMinutes();

    let periods: any[] = [];

    if (day >= 1 && day <= 5) periods = horarios.weekday || [];
    if (day === 6) periods = horarios.saturday || [];
    if (day === 0) periods = horarios.sunday || [];

    for (const p of periods) {
      const [oh, om] = p.open.split(":").map(Number);
      const [ch, cm] = p.close.split(":").map(Number);

      const open = oh * 60 + om;
      const close = ch * 60 + cm;

      if (current >= open && current < close) return true;
    }

    return false;
  }

  // 🎨 COR DO PIN (FINAL)
  function getColor(clinic: Clinic) {
    if (clinic.tipo === "premium") return "#fbbf24"; // dourado

    const open = isOpenNow(clinic.horarios);
    return open ? "#22c55e" : "#ef4444";
  }

  // 🔎 FILTROS
  function applyFilters(list: Clinic[]) {
    return list.filter((c) => {
      if (filters.tipo !== "todos" && c.tipo !== filters.tipo) return false;
      if (filters.estado !== "todos" && c.estado !== filters.estado) return false;
      if (filters.cidade !== "todos" && c.cidade !== filters.cidade) return false;
      if (filters.bairro !== "todos" && c.bairro !== filters.bairro) return false;

      const open = isOpenNow(c.horarios);

      if (filters.status === "abertos" && !open) return false;
      if (filters.status === "fechados" && open) return false;
      if (filters.status === "premium" && c.tipo !== "premium") return false;

      return true;
    });
  }

  const filtered = applyFilters(locais);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <div style={{ width: "100%", height: "100vh" }}>

      {/* 🎛️ FILTROS */}
      <div style={{
        padding: 10,
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        background: "#111",
        borderBottom: "1px solid #222"
      }}>

        <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="todos">Todos</option>
          <option value="abertos">Abertos</option>
          <option value="fechados">Fechados</option>
          <option value="premium">Premium</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
          <option value="todos">Todos Tipos</option>
          <option value="clinica">Clínica</option>
          <option value="massagem">Massagem</option>
          <option value="boate">Boate</option>
          <option value="prive">Privê</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
          <option value="todos">Todos Estados</option>
          <option value="SP">SP</option>
          <option value="RJ">RJ</option>
          <option value="MG">MG</option>
        </select>

      </div>

      {/* 🗺️ MAPA */}
      <GoogleMap
        zoom={12}
        center={{ lat: -23.5505, lng: -46.6333 }}
        mapContainerStyle={{ width: "100%", height: "90vh" }}
        options={{
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1f1f1f" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1f1f1f" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "road", stylers: [{ color: "#2c2c2c" }] },
            { featureType: "water", stylers: [{ color: "#0f172a" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {filtered.map((local) => (
          <Marker
            key={local.id}
            position={{
              lat: Number(local.lat),
              lng: Number(local.lng),
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: getColor(local),
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
            onClick={() => router.push(`/clinica/${local.id}`)}
          />
        ))}
      </GoogleMap>
    </div>
  );
}