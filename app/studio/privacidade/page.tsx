import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacidade Studio",
  description: "Política de privacidade do PrivacyLog Studio.",
  product: "studio",
  path: "/privacidade",
});

export default function StudioPrivacyPage() {
  return (
    <main className="studio-shell studio-secondary-page">
      <section className="studio-page-hero">
        <div className="studio-container studio-legal">
          <p className="studio-kicker">Privacidade</p>
          <h1>Política de privacidade</h1>
          <p>
            Coletamos apenas dados necessários para operar sites, formulários,
            painel, suporte, estatísticas e contatos comerciais. Dados de login
            usam Supabase Auth e não devem expor senhas ao PrivacyLog.
          </p>
          <p>
            O Studio foi desenhado para privacidade: contato por WhatsApp
            click-to-chat, localização aproximada quando desejado, logs
            administrativos e estrutura para consentimento de imagens.
          </p>
        </div>
      </section>
    </main>
  );
}
