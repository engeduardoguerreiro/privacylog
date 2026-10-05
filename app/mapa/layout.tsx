import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// A pagina do mapa e client component: titulo e canonical ficam aqui.
export const metadata = pageMetadata({
  title: "Mapa de massagem sensual perto de você | PrivacyLog",
  description:
    "Encontre no mapa casas de massagem sensual, tântrica e relaxante, clínicas e privês perto de você, com endereço, rota e contato reservado.",
  path: "/mapa",
});

export default function MapaLayout({ children }: { children: ReactNode }) {
  return children;
}
