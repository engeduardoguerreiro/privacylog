import Image from "next/image";
import Link from "next/link";
import { Home, ImageIcon, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import type { StudioClinic } from "@/lib/studio/types";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "professionals", label: "Modelos", icon: UsersRound },
  { key: "photos", label: "Fotos da casa", icon: ImageIcon },
] as const;

export default function ClinicAdminFrame({
  active,
  children,
  clinic,
}: {
  active: "dashboard" | "professionals" | "photos";
  children: ReactNode;
  clinic: StudioClinic;
}) {
  const hrefs = {
    dashboard: `/studio/clinicas/${clinic.slug}/admin`,
    professionals: `/studio/clinicas/${clinic.slug}/admin/profissionais`,
    photos: `/studio/clinicas/${clinic.slug}/admin/fotos`,
  };

  return (
    <main className="clinic-admin-premium">
      <aside className="clinic-admin-sidebar" aria-label="Navegação da clínica">
        <Link href={hrefs.dashboard} className="clinic-admin-sidebar-logo" aria-label="Dashboard">
          <Image src={clinic.logoUrl} alt="" fill sizes="56px" />
        </Link>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={hrefs[item.key]}
                className={active === item.key ? "is-active" : ""}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={23} />
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="clinic-admin-premium-panel">{children}</section>
    </main>
  );
}
