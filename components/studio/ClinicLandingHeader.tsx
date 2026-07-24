"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import { buildWhatsAppUrl } from "@/lib/studio/data";
import { getMainSiteUrl } from "@/lib/subdomain";
import type { StudioClinic } from "@/lib/studio/types";
import { StudioTrackedWhatsAppLink } from "./StudioAnalyticsTracker";

export default function ClinicLandingHeader({ clinic }: { clinic: StudioClinic }) {
  const [open, setOpen] = useState(false);
  const message = `Olá, vim pela vitrine da ${clinic.name} e gostaria de consultar disponibilidade para hoje.`;
  // URL absoluta: a casa pode estar no proprio dominio, entao "/" voltaria
  // para ela mesma em vez da home do PrivacyLog.
  const privacyLogHome = getMainSiteUrl();
  const links = [
    { href: "#inicio", label: "Início" },
    { href: `/studio/clinicas/${clinic.slug}/admin/login`, label: "Login" },
  ];

  return (
    <header className="clinic-landing-header">
      <Link href="#inicio" className="clinic-landing-brand" aria-label={clinic.name}>
        <Image
          className="clinic-landing-logo"
          src={clinic.logoUrl}
          alt=""
          width={168}
          height={42}
        />
        <strong>{clinic.name}</strong>
      </Link>
      <button
        type="button"
        className="clinic-menu-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={open ? "is-open" : ""}>
        <a
          className="clinic-back-to-privacylog"
          href={privacyLogHome}
          onClick={() => setOpen(false)}
        >
          <ArrowLeft size={15} />
          PrivacyLog
        </a>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <StudioTrackedWhatsAppLink
          href={buildWhatsAppUrl(clinic.whatsapp, message)}
          clinicId={clinic.id}
          clinicSlug={clinic.slug}
          source="header"
        >
          Chamar no WhatsApp
        </StudioTrackedWhatsAppLink>
      </nav>
    </header>
  );
}
