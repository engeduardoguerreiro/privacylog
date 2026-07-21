import { Camera } from "lucide-react";

export default function StudioPanelPhotosPage() {
  return (
    <>
      <p className="studio-kicker">Fotos do ambiente</p>
      <h1>Galeria ilimitada da clinica</h1>
      <section className="studio-panel-card">
        <div className="studio-upload-row wide">
          {Array.from({ length: 8 }).map((_, index) => (
            <button key={index} type="button" className="studio-upload-slot">
              <Camera size={22} />
              Ambiente {index + 1}
            </button>
          ))}
        </div>
        <p>
          No plano publicado, o upload usa Supabase Storage com validacao de
          tamanho, tipo e permissao por owner/admin.
        </p>
      </section>
    </>
  );
}
