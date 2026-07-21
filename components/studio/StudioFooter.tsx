import Image from "next/image";
import Link from "next/link";

export default function StudioFooter() {
  return (
    <footer className="studio-footer">
      <div className="studio-container studio-footer-grid">
        <div className="studio-footer-brand">
          <div className="studio-footer-logo">
            <Image src="/brand/logo-studio.png" alt="" width={36} height={36} />
            <strong>
              Privacy Log <span>Studio</span>
            </strong>
          </div>
          <p>
            Plataforma premium para clÃ­nicas que valorizam exclusividade,
            organizaÃ§Ã£o e resultados.
          </p>
          <div className="studio-socials" aria-label="Redes sociais">
            <Link href="/studio">IG</Link>
            <Link href="/studio">IN</Link>
            <Link href="/studio">YT</Link>
          </div>
        </div>

        <nav aria-label="NavegaÃ§Ã£o Studio">
          <strong>NavegaÃ§Ã£o</strong>
          <Link href="/studio">InÃ­cio</Link>
          <Link href="/studio#recursos">Recursos</Link>
          <Link href="/studio/planos">Planos</Link>
          <Link href="/studio#exemplos">Cases</Link>
          <Link href="/studio#sobre">Sobre</Link>
        </nav>

        <nav aria-label="Suporte Studio">
          <strong>Suporte</strong>
          <Link href="/studio/termos">Termos de uso</Link>
          <Link href="/studio/privacidade">PolÃ­tica de privacidade</Link>
          <Link href="/studio/contato">Fale conosco</Link>
        </nav>

        <div className="studio-footer-contact">
          <strong>Contato</strong>
          <span>contato@privacylog.studio</span>
          <span>+55 (11) 9999-9999</span>
          <span>SÃ£o Paulo - SP</span>
        </div>
      </div>
      <div className="studio-container studio-footer-bottom">
        <span>Â© 2026 PrivacyLog Studio. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

