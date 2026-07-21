import Link from "next/link";
import {
  BarChart3,
  Building2,
  Crown,
  Flag,
  LayoutDashboard,
  Map,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getAdminEmails } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AdminProduct = "studio" | "forum" | "club" | "lounge";

const products: Array<{
  id: AdminProduct;
  label: string;
  subtitle: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "studio",
    label: "Studio",
    subtitle: "Sites, leads, clínicas parceiras e planos B2B.",
    href: "/admin?tab=studio",
    icon: Sparkles,
  },
  {
    id: "forum",
    label: "Forum",
    subtitle: "Categorias, tópicos, respostas, avisos e moderação.",
    href: "/admin?tab=forum",
    icon: MessageSquareText,
  },
  {
    id: "club",
    label: "Club",
    subtitle: "Anúncios, aprovação, denúncias, cidades e assinaturas.",
    href: "/admin?tab=club",
    icon: Crown,
  },
  {
    id: "lounge",
    label: "Lounge",
    subtitle: "Mapa, clínicas, boates, privês, premium e cadastro.",
    href: "/admin?tab=lounge",
    icon: Map,
  },
];

export default async function EcosystemAdminPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const activeTab = readProduct(params.tab);
  const [
    {
      data: { user },
    },
    metrics,
  ] = await Promise.all([supabase.auth.getUser(), loadAdminMetrics(supabase)]);
  const activeProduct = products.find((product) => product.id === activeTab) || products[0];
  const tabData = buildTabData(activeTab, metrics);
  const AdminIcon = activeProduct.icon;

  return (
    <main className="ecosystem-admin-shell">
      <section className="ecosystem-admin-container">
        <header className="ecosystem-admin-hero">
          <div>
            <p className="ecosystem-admin-kicker">PrivacyLog Admin</p>
            <h1>Administração geral do ecossistema</h1>
            <p>
              Um painel central para operar Studio, Forum, Club e Lounge com o acesso
              administrador principal.
            </p>
          </div>
          <div className="ecosystem-admin-identity">
            <ShieldCheck size={22} />
            <span>Administrador</span>
            <strong>{user?.email || getAdminEmails()[0]}</strong>
          </div>
        </header>

        <nav className="ecosystem-admin-tabs" aria-label="Produtos PrivacyLog">
          {products.map((product) => {
            const Icon = product.icon;
            const isActive = product.id === activeTab;

            return (
              <Link
                key={product.id}
                href={product.href}
                className={isActive ? "is-active" : ""}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} />
                <span>{product.label}</span>
              </Link>
            );
          })}
        </nav>

        <section className="ecosystem-admin-product">
          <div className="ecosystem-admin-product-heading">
            <div className="ecosystem-admin-product-icon">
              <AdminIcon size={28} />
            </div>
            <div>
              <p>{activeProduct.subtitle}</p>
              <h2>Admin {activeProduct.label}</h2>
            </div>
          </div>

          <div className="ecosystem-admin-metrics">
            {tabData.metrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <div className="ecosystem-admin-actions">
            {tabData.actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.href} href={action.href} className={action.primary ? "is-primary" : ""}>
                  <Icon size={18} />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="ecosystem-admin-grid">
          {products.map((product) => {
            const Icon = product.icon;
            const data = buildTabData(product.id, metrics);

            return (
              <article key={product.id} className="ecosystem-admin-card">
                <div>
                  <Icon size={24} />
                  <span>{product.label}</span>
                </div>
                <strong>{data.summary}</strong>
                <p>{product.subtitle}</p>
                <Link href={product.href}>Abrir aba</Link>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

async function loadAdminMetrics(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    studioClinics,
    studioProfessionals,
    studioLeads,
    forumCategories,
    forumTopics,
    forumReplies,
    clubAds,
    clubPending,
    clubApproved,
    clubReports,
    clubCities,
    loungeLocations,
    loungePremium,
  ] = await Promise.all([
    countRows(supabase, "studio_clinics"),
    countRows(supabase, "studio_professionals"),
    countRows(supabase, "studio_leads"),
    countRows(supabase, "forum_categories"),
    countRows(supabase, "forum_topics"),
    countRows(supabase, "forum_replies"),
    countRows(supabase, "ads"),
    countRows(supabase, "ads", "status", "pending"),
    countRows(supabase, "ads", "status", "approved"),
    countRows(supabase, "reports", "status", "open"),
    countRows(supabase, "cities"),
    countRows(supabase, "clinicas"),
    countRows(supabase, "clinicas", "plano", "premium"),
  ]);

  return {
    studioClinics,
    studioProfessionals,
    studioLeads,
    forumCategories,
    forumTopics,
    forumReplies,
    clubAds,
    clubPending,
    clubApproved,
    clubReports,
    clubCities,
    loungeLocations,
    loungePremium,
  };
}

async function countRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  column?: string,
  value?: string
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (column && value) {
    query = query.eq(column, value);
  }

  const { count, error } = await query;

  if (error) return 0;

  return count || 0;
}

function buildTabData(product: AdminProduct, metrics: Awaited<ReturnType<typeof loadAdminMetrics>>) {
  if (product === "studio") {
    return {
      summary: `${metrics.studioClinics} clínicas`,
      metrics: [
        { label: "Clínicas", value: metrics.studioClinics },
        { label: "Profissionais", value: metrics.studioProfessionals },
        { label: "Leads", value: metrics.studioLeads },
        { label: "Templates", value: 5 },
      ],
      actions: [
        { label: "Painel Studio", href: "/admin/studio", icon: LayoutDashboard, primary: true },
        { label: "Clínicas", href: "/admin/studio/clinicas", icon: Building2 },
        { label: "Leads", href: "/admin/studio/leads", icon: Users },
        { label: "Planos", href: "/admin/studio/planos", icon: Crown },
      ],
    };
  }

  if (product === "forum") {
    return {
      summary: `${metrics.forumTopics} tópicos`,
      metrics: [
        { label: "Categorias", value: metrics.forumCategories },
        { label: "Tópicos", value: metrics.forumTopics },
        { label: "Respostas", value: metrics.forumReplies },
        { label: "Avisos", value: "Ativo" },
      ],
      actions: [
        { label: "Painel Forum", href: "/admin/forum", icon: LayoutDashboard, primary: true },
        { label: "Categorias", href: "/forum/categorias", icon: MessageSquareText },
        { label: "Tópicos", href: "/forum/topicos", icon: BarChart3 },
        { label: "Regras", href: "/forum/avisos", icon: ShieldCheck },
      ],
    };
  }

  if (product === "club") {
    return {
      summary: `${metrics.clubPending} pendentes`,
      metrics: [
        { label: "Anúncios", value: metrics.clubAds },
        { label: "Pendentes", value: metrics.clubPending },
        { label: "Aprovados", value: metrics.clubApproved },
        { label: "Denúncias", value: metrics.clubReports },
      ],
      actions: [
        { label: "Moderar Club", href: "/club/admin", icon: LayoutDashboard, primary: true },
        { label: "Aprovações", href: "/club/admin#aprovacao", icon: ShieldCheck },
        { label: "Denúncias", href: "/club/admin#denuncias", icon: Flag },
        { label: "Cidades", href: "/club/admin#cidades", icon: Map },
      ],
    };
  }

  return {
    summary: `${metrics.loungeLocations} locais`,
    metrics: [
      { label: "Locais", value: metrics.loungeLocations },
      { label: "Premium", value: metrics.loungePremium },
      { label: "Mapa", value: "Ativo" },
      { label: "Cidades Club", value: metrics.clubCities },
    ],
    actions: [
      { label: "Painel Lounge", href: "/admin/lounge", icon: LayoutDashboard, primary: true },
      { label: "Cadastrar local", href: "/admin/lounge/cadastrar", icon: Building2 },
      { label: "Gerenciar locais", href: "/admin/dashboard", icon: BarChart3 },
      { label: "Mapa Lounge", href: "/lounge", icon: Map },
    ],
  };
}

function readProduct(value: string | string[] | undefined): AdminProduct {
  const tab = Array.isArray(value) ? value[0] : value;

  return products.some((product) => product.id === tab) ? (tab as AdminProduct) : "studio";
}
