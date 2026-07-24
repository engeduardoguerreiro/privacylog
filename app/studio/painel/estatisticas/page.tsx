import { getStudioClinicDashboardMetrics } from "@/lib/studio/analytics";
import { getOwnedClinicEditor } from "@/lib/studio/owner";
import PanelEmpty from "../PanelEmpty";

export const dynamic = "force-dynamic";

export default async function StudioPanelStatsPage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  const metrics = await getStudioClinicDashboardMetrics(owned.clinic.id);
  const max = Math.max(1, ...metrics.monthlyViews.map((m) => m.value));

  return (
    <>
      <p className="studio-kicker">Métricas</p>
      <h1>Estatísticas da casa</h1>

      <div className="studio-metric-grid" style={{ marginBottom: 20 }}>
        <article className="studio-metric-card">
          <span>Views no mês</span>
          <strong>{metrics.pageViewsMonth}</strong>
        </article>
        <article className="studio-metric-card">
          <span>Views no ano</span>
          <strong>{metrics.pageViewsYear}</strong>
        </article>
        <article className="studio-metric-card">
          <span>Cliques WhatsApp (mês)</span>
          <strong>{metrics.whatsappClicksMonth}</strong>
        </article>
        <article className="studio-metric-card">
          <span>Cliques WhatsApp (ano)</span>
          <strong>{metrics.whatsappClicksYear}</strong>
        </article>
      </div>

      <section className="studio-panel-card">
        <h2>Views por mês (ano atual)</h2>
        <div className="studio-chart-bars" aria-label="Views por mês">
          {metrics.monthlyViews.map((month) => (
            <span
              key={month.label}
              title={`${month.label}: ${month.value}`}
              style={{ height: `${Math.round((month.value / max) * 140) + 4}px` }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
