import { Camera, Plus } from "lucide-react";

export default function ProfessionalForm() {
  return (
    <section className="studio-panel-card">
      <div className="studio-panel-title">
        <span>
          <Plus size={18} />
          Cadastrar profissional
        </span>
      </div>
      <form className="studio-form">
        <div className="studio-form-grid">
          <label>
            Nome artistico
            <input placeholder="Nome publico" />
          </label>
          <label>
            Idade opcional
            <input type="number" min="18" placeholder="25" />
          </label>
        </div>
        <label>
          Descricao curta
          <input placeholder="Resumo para o card publico" />
        </label>
        <label>
          Bio
          <textarea rows={4} placeholder="Texto completo da profissional" />
        </label>
        <label>
          Tags e especialidades
          <input placeholder="Relaxante, VIP, agenda hoje" />
        </label>
        <div className="studio-upload-row">
          {Array.from({ length: 4 }).map((_, index) => (
            <button key={index} type="button" className="studio-upload-slot">
              <Camera size={20} />
              Foto {index + 1}
            </button>
          ))}
        </div>
        <button type="button" className="studio-button primary">
          Salvar profissional
        </button>
      </form>
    </section>
  );
}
