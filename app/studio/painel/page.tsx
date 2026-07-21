import Link from "next/link";
import type { ComponentType } from "react";
import { BarChart3, CalendarDays, Eye, MessageCircle, Share2, Users } from "lucide-react";
import { studioClinics } from "@/lib/studio/data";

export default function StudioPanelPage() {
  const clinic = studioClinics[0];
  const available = clinic.professionals.filter((item) => item.status !== "unavailable");

  return (
    <>
      <p className="studio-kicker">Dashboard</p>
      <h1>Painel da {clinic.name}</h1>
      <div className="studio-metric-grid">
        <Metric icon={Eye} label="Views 7 dias" value="1.248" />
        <Metric icon={MessageCircle} label="Cliques WhatsApp" value="326" />
        <Metric icon={Users} label="Disponiveis hoje" value={available.length} />
        <Metric icon={BarChart3} label="Plano atual" value="Black" />
      </div>
      <div className="studio-panel-grid">
        <article className="studio-panel-card">
          <h2>Atalhos</h2>
          <div className="studio-actions vertical">
            <Link href="/studio/painel/disponibilidade" className="studio-button primary">
              <CalendarDays size={17} />
              Atualizar disponibilidade
            </Link>
            <Link href="/studio/painel/whatsapp-status" className="studio-button secondary">
              <Share2 size={17} />
              Gerar status WhatsApp
            </Link>
            <Link href={`/studio/clinicas/${clinic.slug}`} className="studio-button ghost">
              Ver meu site
            </Link>
          </div>
        </article>
        <article className="studio-panel-card">
          <h2>Disponibilidade atual</h2>
          {available.map((professional) => (
            <p key={professional.id} className="studio-panel-row">
              <strong>{professional.stageName}</strong>
              <span>{professional.availabilityWindow}</span>
            </p>
          ))}
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
