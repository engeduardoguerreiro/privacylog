import { getOwnedClinicEditor } from "@/lib/studio/owner";
import { setOwnProfessionalStatus } from "../actions";
import PanelEmpty from "../PanelEmpty";

export const dynamic = "force-dynamic";

const statuses = [
  { value: "available_now", label: "Agora" },
  { value: "available_today", label: "Hoje" },
  { value: "booked", label: "Agenda cheia" },
  { value: "unavailable", label: "Indisponível" },
];

export default async function StudioPanelAvailabilityPage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  return (
    <>
      <p className="studio-kicker">Agenda</p>
      <h1>Disponibilidade do dia</h1>
      <p className="studio-panel-lead">
        Toque no estado de cada modelo. A mudança aparece na hora na página da casa.
      </p>

      {owned.professionals.length === 0 ? (
        <article className="studio-panel-card">
          <p>Cadastre modelos em “Modelos” para controlar a disponibilidade.</p>
        </article>
      ) : (
        <div className="studio-availability-list">
          {owned.professionals.map((professional) => (
            <article key={professional.id} className="studio-panel-card">
              <div className="studio-availability-row">
                <strong>{professional.stage_name || "Sem nome"}</strong>
                <form
                  action={setOwnProfessionalStatus}
                  className="studio-availability-actions"
                >
                  <input type="hidden" name="professional_id" value={professional.id} />
                  {statuses.map((status) => {
                    const active = professional.status === status.value;

                    return (
                      <button
                        key={status.value}
                        type="submit"
                        name="status"
                        value={status.value}
                        className={`studio-button ${active ? "primary" : "ghost"}`}
                        aria-pressed={active}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
