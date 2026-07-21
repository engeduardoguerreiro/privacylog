import { studioClinics } from "@/lib/studio/data";

export default function StudioPanelProfilePage() {
  const clinic = studioClinics[0];

  return (
    <>
      <p className="studio-kicker">Perfil da clinica</p>
      <h1>Dados publicos</h1>
      <section className="studio-panel-card">
        <form className="studio-form">
          <label>
            Nome da clinica
            <input defaultValue={clinic.name} />
          </label>
          <div className="studio-form-grid">
            <label>
              Cidade
              <input defaultValue={clinic.city} />
            </label>
            <label>
              Bairro
              <input defaultValue={clinic.neighborhood} />
            </label>
          </div>
          <label>
            Descricao
            <textarea rows={5} defaultValue={clinic.description} />
          </label>
          <label>
            WhatsApp
            <input defaultValue={clinic.whatsapp} />
          </label>
          <button type="button" className="studio-button primary">
            Salvar perfil
          </button>
        </form>
      </section>
    </>
  );
}
