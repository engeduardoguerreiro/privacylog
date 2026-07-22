import Link from "next/link";
import { Building2, Crown, MapPinPlus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

async function countRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string
) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) return 0;
  return count || 0;
}

const actions = [
  {
    icon: Building2,
    title: "Clínicas assinantes",
    text: "Aprove e gerencie as casas que assinam o sistema.",
    href: "/admin/studio/clinicas",
  },
  {
    icon: MapPinPlus,
    title: "Cadastrar no mapa",
    text: "Adicione clínicas ao mapa global (não dependem de assinatura).",
    href: "/admin/lounge/cadastrar",
  },
  {
    icon: Users,
    title: "Leads",
    text: "Veja quem pediu para anunciar a casa.",
    href: "/admin/studio/leads",
  },
  {
    icon: Crown,
    title: "Planos",
    text: "Gerencie os planos e o que cada um oferece.",
    href: "/admin/studio/planos",
  },
];

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [subscribers, models, leads, mapClinics] = await Promise.all([
    countRows(supabase, "studio_clinics"),
    countRows(supabase, "studio_professionals"),
    countRows(supabase, "studio_leads"),
    countRows(supabase, "clinicas"),
  ]);

  const metrics = [
    { label: "Clínicas assinantes", value: subscribers },
    { label: "Modelos", value: models },
    { label: "Leads", value: leads },
    { label: "Clínicas no mapa", value: mapClinics },
  ];

  return (
    <div>
      <p className={styles.kicker}>Administração</p>
      <h1 className={styles.pageTitle}>Visão geral</h1>
      <p className={styles.lead}>
        Painel único do PrivacyLog. Gerencie as clínicas assinantes e as clínicas
        do mapa a partir do menu ao lado.
      </p>

      <div className={styles.metrics}>
        {metrics.map((metric) => (
          <div key={metric.label} className={styles.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.cards}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className={styles.actionCard}>
              <span className={styles.actionIcon}>
                <Icon size={22} />
              </span>
              <h3>{action.title}</h3>
              <p>{action.text}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
