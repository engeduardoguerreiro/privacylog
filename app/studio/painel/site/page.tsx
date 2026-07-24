import Link from "next/link";
import { getMainSiteUrl } from "@/lib/subdomain";
import { getOwnedClinicEditor } from "@/lib/studio/owner";
import PanelEmpty from "../PanelEmpty";
import PanelIdentity from "./PanelIdentity";

export const dynamic = "force-dynamic";

function str(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

export default async function StudioPanelSitePage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  const c = owned.clinic as Record<string, unknown> & { slug?: string };
  const slug = str(c.slug);
  const publicPath = `/studio/clinicas/${slug}`;
  const publicUrl = `${getMainSiteUrl()}${publicPath}`.replace("https://", "");
  const published = str(c.status) === "approved";

  return (
    <>
      <p className="studio-kicker">Meu site</p>
      <h1>Identidade e endereço da casa</h1>

      <section className="studio-panel-card" style={{ marginBottom: 20 }}>
        <p>
          Endereço da página: <strong>{publicUrl}</strong>
        </p>
        {c.custom_domain ? (
          <p>
            Domínio próprio: <strong>{str(c.custom_domain)}</strong>
          </p>
        ) : null}
        <p>
          {published
            ? "Sua página está no ar."
            : "Sua página entra no ar assim que a assinatura for confirmada."}
        </p>
        <div className="studio-actions">
          <Link href={publicPath} className="studio-button primary" target="_blank">
            Abrir site
          </Link>
          <Link href="/studio/painel/perfil" className="studio-button secondary">
            Editar informações
          </Link>
        </div>
      </section>

      <h2 className="studio-panel-subtitle">Identidade visual</h2>
      <p className="studio-panel-lead">
        Escolha o logotipo, a capa e o tema de cores da sua página.
      </p>
      <PanelIdentity
        logoUrl={str(c.logo_url)}
        coverUrl={str(c.main_image_url)}
        theme={str(c.theme) || "champagne"}
      />
    </>
  );
}
