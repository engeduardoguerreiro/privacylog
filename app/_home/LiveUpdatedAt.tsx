"use client";

import { useEffect, useState } from "react";

/**
 * Mostra ha quanto tempo os dados do painel foram gerados.
 * A home usa ISR (revalidate=60), entao o HTML pode ser servido alguns
 * segundos depois da consulta: o tempo e calculado no cliente para nao
 * afirmar "agora" quando ja nao e.
 */
function labelFor(iso: string) {
  const elapsed = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(Math.max(0, elapsed) / 60000);

  if (minutes < 1) return "há instantes";
  if (minutes === 1) return "há 1 minuto";
  if (minutes < 60) return `há ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
}

export default function LiveUpdatedAt({ iso }: { iso: string }) {
  // Comeca no rotulo do servidor para nao divergir na hidratacao.
  const [label, setLabel] = useState("há instantes");

  useEffect(() => {
    const update = () => setLabel(labelFor(iso));
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [iso]);

  return <>{label}</>;
}
