import { createAdminClient } from "@/lib/supabase/admin";

type MonthlyPoint = {
  label: string;
  value: number;
};

export type StudioClinicDashboardMetrics = {
  pageViewsMonth: number;
  pageViewsYear: number;
  whatsappClicksMonth: number;
  whatsappClicksYear: number;
  monthlyViews: MonthlyPoint[];
};

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function rangeForCurrentMonth(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function rangeForCurrentYear(now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function emptyMonthlyViews(): MonthlyPoint[] {
  return monthLabels.map((label) => ({ label, value: 0 }));
}

async function countRows(table: string, clinicId: number, start: string, end: string) {
  const supabase = createAdminClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("clinic_id", clinicId)
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) {
    console.warn(`Studio analytics table unavailable: ${table}`, error.message);
    return 0;
  }

  return count || 0;
}

export async function getStudioClinicDashboardMetrics(
  clinicId: number
): Promise<StudioClinicDashboardMetrics> {
  const supabase = createAdminClient();
  const month = rangeForCurrentMonth();
  const year = rangeForCurrentYear();

  const [pageViewsMonth, pageViewsYear, whatsappClicksMonth, whatsappClicksYear] = await Promise.all([
    countRows("studio_page_views", clinicId, month.start, month.end),
    countRows("studio_page_views", clinicId, year.start, year.end),
    countRows("studio_whatsapp_clicks", clinicId, month.start, month.end),
    countRows("studio_whatsapp_clicks", clinicId, year.start, year.end),
  ]);

  if (!supabase) {
    return {
      pageViewsMonth,
      pageViewsYear,
      whatsappClicksMonth,
      whatsappClicksYear,
      monthlyViews: emptyMonthlyViews(),
    };
  }

  // Uma contagem por mes (head: true, sem baixar linhas). Antes baixava todas
  // as visitas do ano para contar no Node, e o PostgREST corta em 1000
  // linhas: o grafico ficava errado para casas com mais acesso.
  const now = new Date();
  const monthlyViews = await Promise.all(
    monthLabels.map(async (label, monthIndex) => {
      const start = new Date(now.getFullYear(), monthIndex, 1);
      const end = new Date(now.getFullYear(), monthIndex + 1, 1);

      if (start > now) {
        return { label, value: 0 };
      }

      return {
        label,
        value: await countRows(
          "studio_page_views",
          clinicId,
          start.toISOString(),
          end.toISOString()
        ),
      };
    })
  );

  return {
    pageViewsMonth,
    pageViewsYear,
    whatsappClicksMonth,
    whatsappClicksYear,
    monthlyViews,
  };
}
