import Link from "next/link";

/** Conta logada sem casa vinculada (ex.: admin ou cadastro incompleto). */
export default function PanelEmpty() {
  return (
    <>
      <p className="studio-kicker">Painel</p>
      <h1>Nenhuma casa vinculada</h1>
      <article className="studio-panel-card">
        <p>
          Esta conta ainda não está ligada a nenhuma casa. Se você acabou de se
          cadastrar, conclua a assinatura; se acha que isto é um engano, fale com
          o PrivacyLog.
        </p>
        <div className="studio-actions" style={{ marginTop: 16 }}>
          <Link href="/studio/painel/assinatura" className="studio-button primary">
            Ir para a assinatura
          </Link>
        </div>
      </article>
    </>
  );
}
