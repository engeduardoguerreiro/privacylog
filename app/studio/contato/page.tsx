import { MessageCircle } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contato Studio",
  description: "Fale com o PrivacyLog Studio para transformar sua casa em uma vitrine premium.",
  product: "studio",
  path: "/contato",
});

export default function StudioContactPage() {
  const whatsapp =
    process.env.NEXT_PUBLIC_PRIVACYLOG_WHATSAPP || "5511999999999";

  return (
    <main className="studio-shell studio-secondary-page">
      <section className="studio-page-hero">
        <div className="studio-container studio-legal">
          <p className="studio-kicker">Contato comercial</p>
          <h1>Vamos colocar sua marca em outro nível</h1>
          <p>
            Quer vender com mais luxo, aparecer em espaços nobres e receber
            clientes mais decididos? Chame o Studio e entre para a vitrine
            PrivacyLog.
          </p>
          <a
            className="studio-button primary"
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Quero falar com o Studio
          </a>
        </div>
      </section>
    </main>
  );
}
