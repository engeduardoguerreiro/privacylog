"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/auth/admin";
import { signOut } from "@/app/login/actions";
import styles from "../home.module.css";

const baseLinks = [
  { href: "/#modelos", label: "Modelos" },
  { href: "/#clinicas", label: "Clínicas" },
  { href: "/lounge/mapa", label: "Mapa" },
];

type Account = { email: string | null; isAdmin: boolean } | null;

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<Account>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const user = data.user;
      setAccount(
        user ? { email: user.email ?? null, isAdmin: isAdminEmail(user.email) } : null
      );
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAccount(
        user ? { email: user.email ?? null, isAdmin: isAdminEmail(user.email) } : null
      );
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loggedIn = Boolean(account);
  const panelHref = account?.isAdmin ? "/admin" : "/studio/painel";
  const panelLabel = account?.isAdmin ? "Admin" : "Painel";

  const navLinks = loggedIn
    ? [...baseLinks, { href: panelHref, label: panelLabel }]
    : [...baseLinks, { href: "/login", label: "Entrar" }];

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
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          {loggedIn ? (
            <form action={signOut}>
              <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
                Sair
              </button>
            </form>
          ) : (
            <Link href="/studio" className={`${styles.btn} ${styles.btnPrimary}`}>
              Quero anunciar
            </Link>
          )}
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
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        {loggedIn ? (
          <form action={signOut} style={{ marginTop: 12 }}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnGhost}`}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Sair
            </button>
          </form>
        ) : (
          <Link
            href="/studio"
            onClick={() => setOpen(false)}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ marginTop: 12, justifyContent: "center" }}
          >
            Quero anunciar
          </Link>
        )}
      </div>
    </>
  );
}
