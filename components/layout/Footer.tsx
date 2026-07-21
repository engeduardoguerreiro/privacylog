import Link from "next/link";

export default function Footer() {
  return (
    <footer className="premium-footer">
      <div className="site-container premium-footer-inner">
        <p>PrivacyLog © 2026</p>
        <div className="flex flex-wrap gap-5">
          <Link href="/lounge">Lounge</Link>
          <Link href="/studio">Studio</Link>
          <a href="mailto:contato@privacylog.com.br">Contato</a>
        </div>
      </div>
    </footer>
  );
}
