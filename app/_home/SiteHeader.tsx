"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "../home.module.css";

const links = [
  { href: "#modelos", label: "Modelos" },
  { href: "#clinicas", label: "Clínicas" },
  { href: "/lounge/mapa", label: "Mapa" },
  { href: "/login", label: "Entrar" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
      >
        <Link href="/" className={styles.brand} aria-label="PrivacyLog">
          <Image
            src="/brand/privacylog-mark.png"
            alt=""
            width={42}
            height={44}
            className={styles.brandMark}
            priority
          />
          <span className={styles.brandText}>
            Privacy<b>Log</b>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Link href="/studio" className={`${styles.btn} ${styles.btnPrimary}`}>
            Quero anunciar
          </Link>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/studio"
          onClick={() => setOpen(false)}
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ marginTop: 12, justifyContent: "center" }}
        >
          Quero anunciar
        </Link>
      </div>
    </>
  );
}
