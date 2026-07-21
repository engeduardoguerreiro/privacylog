import Link from "next/link";
import PartnerClinicCard from "@/components/studio/PartnerClinicCard";
import { pageMetadata } from "@/lib/seo";
import { studioClinics } from "@/lib/studio/data";

export const metadata = pageMetadata({
  title: "Portfolio PrivacyLog Studio",
  description: "Vitrines premium PrivacyLog Studio criadas para divulgar casas adultas com luxo, discricao e apelo comercial.",
  product: "studio",
  path: "/portfolio",
});

export default function StudioPortfolioPage() {
  return (
    <main className="studio-shell">
      <section className="studio-page-hero">
        <div className="studio-container">
          <p className="studio-kicker">Vitrines de desejo</p>
          <h1>Casas que aparecem com mais classe vendem antes da conversa</h1>
          <p>
            Uma pagina bem posicionada faz o visitante sentir confianca,
            curiosidade e vontade de reservar. Aqui, cada casa parceira aparece
            como marca, nao como anuncio perdido.
          </p>
          <Link href="/studio/solicitar-site" className="studio-button primary">
            Quero minha vitrine aqui
          </Link>
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-container studio-clinic-grid">
          {studioClinics.map((clinic) => (
            <PartnerClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      </section>
    </main>
  );
}
