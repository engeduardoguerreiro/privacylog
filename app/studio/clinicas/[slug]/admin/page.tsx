import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { BarChart3, MessageCircle, Users } from "lucide-react";
import ClinicAdminFrame from "@/components/studio/ClinicAdminFrame";
import ClinicDashboardChart from "@/components/studio/ClinicDashboardChart";
import { isAdminUser } from "@/lib/auth/admin";
import { getStudioClinicDashboardMetrics } from "@/lib/studio/analytics";
import { getApprovedStudioClinicBySlug } from "@/lib/studio/db";
import { createClient } from "@/lib/supabase/server";

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function ClinicAdminDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/studio/clinicas/${slug}/admin/login`);
  }

  const clinic = await getApprovedStudioClinicBySlug(slug);

  if (!clinic || (clinic.ownerId !== user.id && !isAdminUser(user))) {
    redirect(`/studio/clinicas/${slug}/admin/login?access=denied`);
  }

  const active = clinic.professionals.filter((professional) => professional.isActive);
  const metrics = await getStudioClinicDashboardMetrics(clinic.id);

  return (
    <ClinicAdminFrame clinic={clinic} active="dashboard">
      <div className="clinic-admin-dashboard-head">
        <div>
          <p className="clinic-admin-eyebrow">Painel administrativo</p>
          <h1>Dashboard</h1>
          <span>{clinic.name}</span>
        </div>
        <Link className="clinic-admin-soft-action" href={`/studio/clinicas/${slug}`}>
          Ver página pública
        </Link>
      </div>

      <div className="clinic-admin-premium-metrics">
        <article>
          <BarChart3 size={22} />
          <span>Visualizações</span>
          <strong>{formatNumber(metrics.pageViewsMonth)}</strong>
          <small>{formatNumber(metrics.pageViewsYear)} no ano</small>
        </article>
        <article>
          <MessageCircle size={22} />
          <span>Contatos WhatsApp</span>
          <strong>{formatNumber(metrics.whatsappClicksMonth)}</strong>
          <small>{formatNumber(metrics.whatsappClicksYear)} no ano</small>
        </article>
        <article>
          <Users size={22} />
          <span>Modelos ativas</span>
          <strong>{formatNumber(active.length)}</strong>
          <small>Ativas na vitrine</small>
        </article>
      </div>

      <ClinicDashboardChart metrics={metrics} />
    </ClinicAdminFrame>
  );
}
