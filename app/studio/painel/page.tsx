import Link from "next/link";
import type { ComponentType } from "react";
import { BarChart3, CalendarDays, Eye, MessageCircle, Share2, Users } from "lucide-react";
import { getStudioClinicDashboardMetrics } from "@/lib/studio/analytics";
import { getPlanLabel } from "@/lib/studio/data";
import { getOwnedClinicEditor } from "@/lib/studio/owner";
import type { StudioPlanSlug } from "@/lib/studio/types";
import PanelEmpty from "./PanelEmpty";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  available_now: "Disponivel agora",
  available_today: "Disponivel hoje",
  booked: "Agenda cheia",
  unavailable: "Indisponivel",
};

export default async function StudioPanelPage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  const clinic = owned.clinic as Record<string, unknown> & {
    id: number;
    name?: string;
    slug?: string;
    plan?: string;
  };

  const metrics = await getStudioClinicDashboardMetrics(clinic.id);
  const available = owned.professionals.filter(
    (item) => item.status !== "unavailable" && item.is_public !== false
  );

  return (
    <>
      <p className="studio-kicker">Dashboard</p>
      <h1>Painel da {clinic.name || "sua casa"}</h1>
      <div className="studio-metric-grid">
        <Metric icon={Eye} label="Views no mes" value={metrics.pageViewsMonth} />
        <Metric
          icon={MessageCircle}
          label="Cliques WhatsApp (mes)"
          value={metrics.whatsappClicksMonth}
        />
        <Metric icon={Users} label="Disponiveis hoje" value={available.length} />
        <Metric
          icon={BarChart3}
          label="Plano atual"
          value={getPlanLabel((clinic.plan as StudioPlanSlug) || "essential")}
        />
      </div>
      <div className="studio-panel-grid">
        <article className="studio-panel-card">
          <h2>Atalhos</h2>
          <div className="studio-actions vertical">
            <Link href="/studio/painel/disponibilidade" className="studio-button primary">
              <CalendarDays size={17} />
              Atualizar disponibilidade
            </Link>
            <Link href="/studio/painel/massagistas" className="studio-button secondary">
              <Users size={17} />
              Gerenciar modelos
            </Link>
            {clinic.slug ? (
              <Link href={`/studio/clinicas/${clinic.slug}`} className="studio-button ghost">
                <Share2 size={17} />
                Ver meu site
              </Link>
            ) : null}
          </div>
        </article>
        <article className="studio-panel-card">
          <h2>Disponibilidade atual</h2>
          {available.length ? (
            available.map((professional) => (
              <p key={professional.id} className="studio-panel-row">
                <strong>{professional.stage_name}</strong>
                <span>{statusLabel[professional.status || ""] || "Disponivel hoje"}</span>
              </p>
            ))
          ) : (
            <p className="studio-panel-row">
              <span>Nenhuma modelo ativa hoje. Cadastre em “Modelos”.</span>
            </p>
          )}
        </article>
      </div>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: string | number;
}) {
  return (
    <article className="studio-metric-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
