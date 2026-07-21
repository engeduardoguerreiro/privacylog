import Link from "next/link";
import {
  getStudioClinicPrimaryUrl,
  getStudioClinicPublicPath,
  studioClinics,
} from "@/lib/studio/data";

export default function StudioPanelSitePage() {
  const clinic = studioClinics[0];

  return (
    <>
      <p className="studio-kicker">Meu site</p>
      <h1>Pagina publica ativa</h1>
      <section className="studio-panel-card">
        <p>
          URL principal:{" "}
          <strong>{getStudioClinicPrimaryUrl(clinic).replace("https://", "")}</strong>
        </p>
        <p>
          Endereco Studio: <strong>{clinic.studioPath}</strong>
        </p>
        {clinic.clinicSubdomain ? (
          <p>
            Subdominio: <strong>{clinic.clinicSubdomain}</strong>
          </p>
        ) : null}
        {clinic.customDomain ? (
          <p>
            Dominio proprio: <strong>{clinic.customDomain}</strong>
            <br />
            <small>{clinic.domainRenewalNote}</small>
          </p>
        ) : null}
        <p>
          O sistema esta preparado para mapear subdominios e dominios
          customizados para a mesma pagina publica da clinica.
        </p>
        <div className="studio-actions">
          <Link href={getStudioClinicPublicPath(clinic)} className="studio-button primary">
            Abrir site
          </Link>
          <Link href="/studio/painel/perfil" className="studio-button secondary">
            Editar informacoes
          </Link>
        </div>
      </section>
    </>
  );
}
