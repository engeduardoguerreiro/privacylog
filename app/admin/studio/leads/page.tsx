import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

type Lead = {
  id: number;
  clinic_name: string | null;
  responsible_name: string | null;
  whatsapp: string | null;
  city: string | null;
  interested_plan: string | null;
  status: string | null;
  created_at: string | null;
};

const planLabels: Record<string, string> = {
  black: "Black",
  premium: "Premium",
  essential: "Essencial",
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
  let leads: Lead[] = [];
  let loadError: string | null = null;

  if (!supabase) {
    loadError = "SUPABASE_SERVICE_ROLE_KEY não configurada.";
  } else {
    const { data, error } = await supabase
      .from("studio_leads")
      .select(
        "id, clinic_name, responsible_name, whatsapp, city, interested_plan, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      loadError = error.message;
    } else {
      leads = (data as Lead[]) || [];
    }
  }

  return (
    <div>
      <p className={styles.kicker}>Clínicas assinantes</p>
      <h1 className={styles.pageTitle}>Leads</h1>
      <p className={styles.lead}>
        Casas que pediram para anunciar. Fale com elas pelo WhatsApp informado.
      </p>

      {loadError ? (
        <div className={styles.notice}>Não foi possível carregar: {loadError}</div>
      ) : null}

      {!loadError && leads.length === 0 ? (
        <div className={styles.notice}>
          Nenhum lead ainda. Quando alguém preencher o formulário de anunciar,
          aparece aqui.
        </div>
      ) : null}

      {leads.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Casa</th>
                <th>Responsável</th>
                <th>WhatsApp</th>
                <th>Cidade</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Recebido</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.clinic_name || "Sem nome"}</strong>
                  </td>
                  <td>{lead.responsible_name || "—"}</td>
                  <td>
                    {lead.whatsapp ? (
                      <a
                        className={styles.rowBtn}
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {lead.whatsapp}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{lead.city || "—"}</td>
                  <td>
                    {lead.interested_plan
                      ? planLabels[lead.interested_plan] || lead.interested_plan
                      : "—"}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeWarn}`}>
                      {lead.status || "novo"}
                    </span>
                  </td>
                  <td>{formatDate(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
