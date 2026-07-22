import Image from "next/image";
import Link from "next/link";
import MobileMenu from "@/components/layout/MobileMenu";

const links = [
  { href: "/studio", label: "Início" },
  { href: "/studio#recursos", label: "Recursos" },
  { href: "/studio/planos", label: "Planos" },
  { href: "/studio#exemplos", label: "Cases" },
  { href: "/studio#sobre", label: "Sobre" },
];

export default function StudioHeader() {
  return (
    <header className="premium-header ecosystem-header studio-product-header">
      <div className="site-container premium-header-inner">
        <Link href="/" className="product-logo" aria-label="PrivacyLog">
          <Image
            src="/brand/privacylog-mark.png"
            alt=""
            width={40}
            height={40}
            className="product-logo-mark"
            priority
          />
          <span className="product-logo-title">
            Privacy<span>Log</span>
          </span>
        </Link>

        <nav className="premium-nav desktop-product-nav" aria-label="Navegação Studio">
          {links.map((link) => {
            return (
              <Link key={link.href} href={link.href} className="premium-nav-link">
                {link.label}
              </Link>
            );
          })}
          <Link href="/studio/solicitar-site" className="premium-nav-cta">
            Quero vender valor de luxo
          </Link>
        </nav>

        <MobileMenu
          links={[
            ...links.map((link) => ({ href: link.href, label: link.label })),
            {
              href: "/studio/solicitar-site",
              label: "Quero vender valor de luxo",
              variant: "cta",
            },
          ]}
        />
      </div>
    </header>
  );
}

