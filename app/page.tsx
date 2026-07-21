import AgeGate from "@/components/AgeGate";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "PrivacyLog | Ecossistema Premium Adulto",
  description:
    "O ecossistema PrivacyLog reúne comunidade, mapa, anúncios e soluções digitais para o mercado adulto premium.",
});

export default function Home() {
  return (
    <main className="privacylog-construction">
      <AgeGate />
      <section className="construction-stage" aria-label="PrivacyLog em construção">
        <span className="construction-glow construction-glow-gold" aria-hidden="true" />
        <span className="construction-glow construction-glow-wine" aria-hidden="true" />

        <div>
          <div className="construction-logo-frame">
            <Image
              src="/logo-main.png"
              alt="PrivacyLog"
              width={720}
              height={720}
              className="construction-logo"
              priority
            />
          </div>

          <div className="construction-copy">
            <p className="construction-kicker">PrivacyLog</p>
            <h1>Estamos preparando uma experiência premium.</h1>
            <p>
              O ecossistema PrivacyLog está em ajustes finais. Em breve, a
              página principal estará disponível com navegação completa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
