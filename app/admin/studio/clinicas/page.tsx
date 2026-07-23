import Link from "next/link";
import { ExternalLink, PencilLine, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../../admin.module.css";
import ConfirmButton from "./ConfirmButton";
import { deleteClinic, setClinicStatus } from "./actions";

export const dynamic = "force-dynamic";

type ClinicRow = {
  id: number;
  name: string | null;
  slug: string | null;
  city: string | null;
  state: string | null;
  plan: string | null;
  status: string | null;
};

const planLabels: Record<string, string> = {
  black: "Black",
  premium: "Premium",
  essential: "Essencial",
};

const statusLabels: Record<string, string> = {
  approved: "Aprovada",
  pending: "Pendente",
  suspended: "Suspensa",
};

export default async function AdminClinicsPage() {
  const supabase = createAdminClient();
  let clinics: ClinicRow[] = [];
  let loadError: string | null = null;

  if (!supabase) {
    loadError = "SUPABASE_SERVICE_ROLE_KEY não configurada.";
  } else {
    const { data, error } = await supabase
      .from("studio_clinics")
      .select("id,name,slug,city,state,plan,status")
      .order("id", { ascending: false });

    if (error) {
      loadError = error.message;
    } else {
      clinics = (data as ClinicRow[]) || [];
    }
  }

  return (
    <div>
      <p className={styles.kicker}>Clínicas assinantes</p>
      <h1 className={styles.pageTitle}>Clínicas</h1>
      <p className={styles.lead}>
        Aprove, suspenda, edite ou exclua as casas que assinam o sistema.
      </p>

      {loadError ? (
        <div className={styles.notice}>Não foi possível carregar: {loadError}</div>
      ) : null}

      {!loadError && clinics.length === 0 ? (
        <div className={styles.notice}>
          Nenhuma clínica cadastrada ainda. Quando uma casa se cadastrar, ela
          aparece aqui para aprovação.
        </div>
      ) : null}

      {clinics.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Clínica</th>
                <th>Cidade</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => {
                const isApproved = clinic.status === "approved";

                return (
                  <tr key={clinic.id}>
                    <td>
                      <strong>{clinic.name || "Sem nome"}</strong>
                      <small>{clinic.slug}</small>
                    </td>
                    <td>
                      {[clinic.city, clinic.state].filter(Boolean).join(" - ") || "—"}
                    </td>
                    <td>
                      {clinic.plan ? planLabels[clinic.plan] || clinic.plan : "—"}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          isApproved
                            ? styles.badgeOk
                            : clinic.status === "suspended"
                            ? styles.badgeOff
                            : styles.badgeWarn
                        }`}
                      >
                        {clinic.status
                          ? statusLabels[clinic.status] || clinic.status
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        {clinic.slug ? (
                          <Link
                            href={`/studio/clinicas/${clinic.slug}/admin`}
                            className={styles.rowBtn}
                          >
                            <PencilLine size={15} />
                            Editar
                          </Link>
                        ) : null}

                        {clinic.slug ? (
                          <Link
                            href={`/studio/clinicas/${clinic.slug}`}
                            className={styles.rowBtn}
                            target="_blank"
                          >
                            <ExternalLink size={15} />
                            Ver
                          </Link>
                        ) : null}

                        <form action={setClinicStatus}>
                          <input type="hidden" name="id" value={clinic.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={isApproved ? "suspended" : "approved"}
                          />
                          <button type="submit" className={styles.rowBtn}>
                            {isApproved ? (
                              <>
                                <ShieldX size={15} />
                                Suspender
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={15} />
                                Aprovar
                              </>
                            )}
                          </button>
                        </form>

                        <form action={deleteClinic}>
                          <input type="hidden" name="id" value={clinic.id} />
                          <ConfirmButton
                            className={`${styles.rowBtn} ${styles.rowBtnDanger}`}
                            message={`Excluir "${clinic.name}"? Esta ação não pode ser desfeita.`}
                          >
                            <Trash2 size={15} />
                            Excluir
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
