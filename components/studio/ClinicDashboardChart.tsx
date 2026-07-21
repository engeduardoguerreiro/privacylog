import type { StudioClinicDashboardMetrics } from "@/lib/studio/analytics";

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getShortLabel(label: string) {
  return label.slice(0, 3);
}

export default function ClinicDashboardChart({
  metrics,
}: {
  metrics: StudioClinicDashboardMetrics;
}) {
  const max = Math.max(1, ...metrics.monthlyViews.map((item) => item.value));

  return (
    <div className="clinic-admin-chart" aria-label="Visualizações por mês">
      <div className="clinic-admin-chart-grid" aria-hidden="true" />
      <div className="clinic-admin-bars">
        {metrics.monthlyViews.map((item) => (
          <div key={item.label} className="clinic-admin-bar-wrap">
            <span
              className="clinic-admin-bar"
              style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
              title={`${item.label}: ${formatNumber(item.value)} visualizações`}
            />
            <small aria-label={item.label}>{getShortLabel(item.label)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
