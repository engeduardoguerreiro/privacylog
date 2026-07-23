import Link from "next/link";
import styles from "../home.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>PrivacyLog © 2026</span>
          <nav className={styles.footerLinks} aria-label="Rodapé">
            <Link href="/studio">Anunciar</Link>
            <Link href="/lounge/mapa">Mapa</Link>
            <Link href="/login">Entrar</Link>
            <a href="mailto:contato@privacylog.com.br">Contato</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
