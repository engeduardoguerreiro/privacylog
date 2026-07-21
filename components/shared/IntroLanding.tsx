import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

type ProductChoice = {
  name: string;
  label: string;
  description: string;
  image: string;
  href?: string;
  accent: "gold" | "wine" | "pink" | "blue";
};

const products: ProductChoice[] = [
  {
    name: "PrivacyLog Studio",
    label: "Studio",
    description: "Área profissional para clínicas e gestão.",
    image: "/brand/logo-studio.png",
    href: "/studio",
    accent: "blue",
  },
  {
    name: "PrivacyLog Lounge",
    label: "Lounge",
    description: "Mapa e guia de locais premium.",
    image: "/brand/logo-lounge.png",
    href: "/lounge",
    accent: "gold",
  },
];

export default function IntroLanding() {
  return (
    <>
      <header className="ecosystem-intro-header" aria-label="Navegação principal">
        <Link href="/" className="ecosystem-intro-brand" aria-label="PrivacyLog início">
          <Image src="/logo-main.png" alt="" width={58} height={58} priority />
          <span>PrivacyLog</span>
        </Link>

        <nav className="ecosystem-intro-nav">
          <Link href="/" className="is-active">
            Início
          </Link>
          <Link href="/studio">Studio</Link>
          <Link href="/lounge">Lounge</Link>
        </nav>

        <Link href="/login" className="ecosystem-intro-login">
          <UserRound size={19} />
          Entrar
        </Link>
      </header>

      <section className="choice-stage is-visible">
        <div className="site-container choice-container">
        <div className="choice-heading">
          <p className="premium-kicker">PrivacyLog</p>
          <h1 className="choice-title">
            Escolha para onde deseja ir no ecossistema <span>PrivacyLog.</span>
          </h1>
          <p className="choice-subtitle">
            Acesse os ambientes da plataforma e navegue pela experiência premium com discrição e clareza.
          </p>
        </div>

        <div className="logo-choice-grid" aria-label="Produtos PrivacyLog">
          {products.map((product, index) => {
            const actionLabel = index === 1 || index === 3 ? "Acessar" : "Explorar";
            const content = (
              <>
                <span className="logo-choice-image-frame">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={360}
                    height={360}
                    className="logo-choice-image"
                    priority
                  />
                </span>
                <span className="logo-choice-copy">
                  <strong>{product.label}</strong>
                  <small>{product.description}</small>
                  <span className="logo-choice-action">
                    {actionLabel}
                    <ArrowRight size={18} />
                  </span>
                </span>
              </>
            );

            if (!product.href) {
              return (
                <button
                  key={product.name}
                  type="button"
                  className={`logo-choice-card logo-choice-${product.accent} is-disabled`}
                  aria-label={`${product.name} em breve`}
                  disabled
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={product.name}
                href={product.href}
                className={`logo-choice-card logo-choice-${product.accent}`}
                aria-label={`Acessar ${product.name}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
        <div className="ecosystem-intro-ornament" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </div>
      </section>
    </>
  );
}
