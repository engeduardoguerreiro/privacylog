"use client";

import Image from "next/image";
import Link from "next/link";
import { Crown, Home, LogIn, Map, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import MobileMenu, { type HeaderLink } from "./MobileMenu";

type HeaderProduct = "main" | "lounge";

const productLogos: Record<HeaderProduct, string | null> = {
  main: null,
  lounge: "/brand/logo-lounge.png",
};

const navigation: Record<HeaderProduct, HeaderLink[]> = {
  main: [
    { href: "/", label: "Início" },
    { href: "/lounge", label: "Lounge" },
    { href: "/studio", label: "Studio" },
    { href: "/login", label: "Entrar" },
  ],
  lounge: [
    { href: "/", label: "Início" },
    { href: "/lounge/mapa", label: "Mapa" },
    { href: "/studio", label: "Quero ser Premium", variant: "cta" },
  ],
};

export default function ProductHeader({
  product = "main",
}: {
  product: HeaderProduct;
}) {
  const links = navigation[product];
  const logo = productLogos[product];

  return (
    <header className="premium-header ecosystem-header">
      <div className="site-container premium-header-inner">
        {logo ? (
          <Link
            href={`/${product}`}
            className="product-logo"
            aria-label={`PrivacyLog ${product}`}
          >
            <Image
              src={logo}
              alt=""
              width={38}
              height={38}
              className="product-logo-mark"
              priority
            />
            <span className="product-logo-title">
              Privacy<span>Log</span>
              <strong>Lounge</strong>
            </span>
          </Link>
        ) : (
          <BrandLogo markSize={42} textClassName="text-[28px]" />
        )}

        <nav className="premium-nav desktop-product-nav" aria-label="Navegação">
          {links.map((link) =>
            link.disabled ? (
              <span key={link.label} className="premium-nav-link is-disabled">
                <Crown size={15} />
                {link.label}
              </span>
            ) : (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={
                  link.variant === "cta"
                    ? "premium-nav-cta"
                    : "premium-nav-link"
                }
              >
                {getIcon(link.label)}
                {link.label}
              </Link>
            )
          )}
        </nav>

        <MobileMenu links={links} />
      </div>
    </header>
  );
}

function getIcon(label: string) {
  const normalized = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("inicio")) {
    return <Home size={16} />;
  }

  if (normalized.includes("mapa") || normalized.includes("lounge")) {
    return <Map size={16} />;
  }

  if (normalized.includes("entrar")) {
    return <LogIn size={16} />;
  }

  return <Sparkles size={16} />;
}
