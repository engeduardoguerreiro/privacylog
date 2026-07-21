"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export type HeaderLink = {
  href: string;
  label: string;
  disabled?: boolean;
  variant?: "default" | "cta";
};

export default function MobileMenu({ links }: { links: HeaderLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-menu">
      <button
        type="button"
        className="mobile-menu-trigger"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={21} />
      </button>

      {open ? (
        <div className="mobile-menu-backdrop" role="presentation">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-top">
              <span>PrivacyLog</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={21} />
              </button>
            </div>

            <nav aria-label="Menu mobile">
              {links.map((link) =>
                link.disabled ? (
                  <span key={link.label} className="mobile-menu-link is-muted">
                    {link.label}
                  </span>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`mobile-menu-link ${
                      link.variant === "cta" ? "is-cta" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
