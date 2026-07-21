import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Camera,
  CreditCard,
  Headphones,
  Home,
  Image,
  LayoutDashboard,
  Share2,
  UserRound,
  Users,
} from "lucide-react";

const items = [
  { href: "/studio/painel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/painel/perfil", label: "Perfil da clinica", icon: Home },
  { href: "/studio/painel/massagistas", label: "Massagistas", icon: Users },
  { href: "/studio/painel/disponibilidade", label: "Disponibilidade", icon: CalendarDays },
  { href: "/studio/painel/fotos", label: "Fotos", icon: Camera },
  { href: "/studio/painel/whatsapp-status", label: "WhatsApp Status", icon: Share2 },
  { href: "/studio/painel/site", label: "Meu site", icon: Image },
  { href: "/studio/painel/estatisticas", label: "Estatisticas", icon: BarChart3 },
  { href: "/studio/painel/plano", label: "Plano", icon: CreditCard },
  { href: "/studio/painel/suporte", label: "Suporte", icon: Headphones },
];

export default function StudioDashboardSidebar() {
  return (
    <aside className="studio-panel-sidebar">
      <div className="studio-panel-user">
        <UserRound size={20} />
        <div>
          <strong>Area da clinica</strong>
          <span>Gestao PrivacyLog Studio</span>
        </div>
      </div>
      <nav aria-label="Painel Studio">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
