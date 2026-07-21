export default function StudioPanelStatsPage() {
  return (
    <>
      <p className="studio-kicker">Metricas</p>
      <h1>Estatisticas da clinica</h1>
      <section className="studio-panel-card">
        <div className="studio-chart-bars" aria-label="Views dos ultimos 7 dias">
          {[42, 68, 51, 90, 74, 110, 126].map((value, index) => (
            <span key={index} style={{ height: `${value}px` }} />
          ))}
        </div>
        <p>
          Estrutura preparada para registrar views, cliques no WhatsApp por
          profissional e geracoes de status.
        </p>
      </section>
    </>
  );
}
