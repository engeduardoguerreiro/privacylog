export default function StudioPanelSupportPage() {
  return (
    <>
      <p className="studio-kicker">Suporte</p>
      <h1>Atendimento PrivacyLog Studio</h1>
      <section className="studio-panel-card">
        <p>
          Precisa alterar dominio, configurar WhatsApp, revisar fotos ou criar
          uma campanha Black? Chame o suporte comercial.
        </p>
        <a
          className="studio-button primary"
          href={`https://wa.me/${(
            process.env.NEXT_PUBLIC_PRIVACYLOG_WHATSAPP || "5511999999999"
          ).replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
        >
          Falar com suporte
        </a>
      </section>
    </>
  );
}
