import { getClinicForCurrentUser } from "@/lib/studio/owner";

export const dynamic = "force-dynamic";

export default async function StudioPanelSupportPage() {
  const clinic = await getClinicForCurrentUser();

  const supportNumber = (
    process.env.NEXT_PUBLIC_PRIVACYLOG_WHATSAPP || "5511999999999"
  ).replace(/\D/g, "");

  const message = clinic
    ? `Ola, aqui e da ${clinic.name} e preciso de ajuda com o painel PrivacyLog.`
    : "Ola, preciso de ajuda com o painel PrivacyLog.";

  return (
    <>
      <p className="studio-kicker">Suporte</p>
      <h1>Atendimento PrivacyLog</h1>
      <section className="studio-panel-card">
        <p>
          Precisa alterar domínio, configurar WhatsApp, revisar fotos ou criar
          uma campanha Black? Chame o suporte comercial.
        </p>
        <a
          className="studio-button primary"
          href={`https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
        >
          Falar com suporte
        </a>
      </section>
    </>
  );
}
