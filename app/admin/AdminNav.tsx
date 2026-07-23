"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Crown,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  MapPin,
  MapPinPlus,
  Megaphone,
  Menu,
  Users,
  X,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import styles from "./admin.module.css";

type Item = { href: string; label: string; icon: typeof LayoutDashboard };
type Section = { title?: string; items: Item[] };

const sections: Section[] = [
  {
    items: [{ href: "/admin", label: "Visão geral", icon: LayoutDashboard }],
  },
  {
    title: "Clínicas assinantes",
    items: [
      { href: "/admin/studio/clinicas", label: "Clínicas", icon: Building2 },
      { href: "/admin/studio/leads", label: "Leads", icon: Users },
      { href: "/admin/studio/planos", label: "Planos", icon: Crown },
    ],
  },
  {
    title: "Mapa",
    items: [
      { href: "/admin/lounge", label: "Clínicas do mapa", icon: MapPin },
      { href: "/admin/lounge/cadastrar", label: "Cadastrar no mapa", icon: MapPinPlus },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/studio/banners", label: "Banners", icon: Megaphone },
      { href: "/admin/studio/relatorios", label: "Relatórios", icon: BarChart3 },
      { href: "/admin/studio/templates", label: "Modelos de site", icon: LayoutTemplate },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
        <Link href="/admin" className={styles.brandText}>
          Privacy<b>Log</b>
        </Link>
      </div>

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <Link href="/admin" className={styles.brand} onClick={() => setOpen(false)}>
          <Image src="/brand/privacylog-mark.png" alt="" width={34} height={36} priority />
          <span className={styles.brandText}>
            Privacy<b>Log</b>
            <span className={styles.brandTag}>Administração</span>
          </span>
        </Link>

        {sections.map((section, index) => (
          <div key={section.title || index}>
            {section.title ? <p className={styles.group}>{section.title}</p> : null}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`${styles.item} ${active ? styles.itemActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className={styles.spacer} />

        <form action={signOut}>
          <button type="submit" className={styles.logout}>
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </aside>
    </>
  );
}
