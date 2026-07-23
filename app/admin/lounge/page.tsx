import Link from "next/link";
import { ExternalLink, MapPinPlus, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../admin.module.css";
import ConfirmButton from "../studio/clinicas/ConfirmButton";
import { deleteMapClinic } from "./actions";

export const dynamic = "force-dynamic";

type MapClinic = {
  id: number;
  nome: string | null;
  tipo: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  plano: string | null;
};

const typeLabels: Record<string, string> = {
  clinica: "Clínica",
  massagem: "Massagem",
  boate: "Boate",
  prive: "Privê",
  predio: "Prédio",
};

const LIMIT = 100;

export default async function AdminMapClinicsPage() {
  const supabase = createAdminClient();
  let clinics: MapClinic[] = [];
  let total = 0;
  let premium = 0;
  let loadError: string | null = null;

  if (!supabase) {
    loadError = "SUPABASE_SERVICE_ROLE_KEY não configurada.";
  } else {
    const [listResult, totalResult, premiumResult] = await Promise.all([
      supabase
        .from("clinicas")
        .select("id,nome,tipo,bairro,cidade,estado,plano")
        .order("nome", { ascending: true })
        .limit(LIMIT),
      supabase.from("clinicas").select("id", { count: "exact", head: true }),
      supabase
        .from("clinicas")
        .select("id", { count: "exact", head: true })
        .eq("plano", "premium"),
    ]);

    if (listResult.error) {
      loadError = listResult.error.message;
    } else {
      clinics = (listResult.data as MapClinic[]) || [];
      total = totalResult.count || 0;
      premium = premiumResult.count || 0;
    }
  }

  return (
    <div>
      <p className={styles.kicker}>Mapa</p>
      <h1 className={styles.pageTitle}>Clínicas do mapa</h1>
      <p className={styles.lead}>
        Locais do diretório global. Não dependem de assinatura e aparecem no mapa
        público.
      </p>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span>Total no mapa</span>
          <strong>{total}</strong>
        </div>
        <div className={styles.metric}>
          <span>Premium</span>
          <strong>{premium}</strong>
        </div>
      </div>

      <div className={styles.submitRow} style={{ marginBottom: 26 }}>
        <Link href="/admin/lounge/cadastrar" className={styles.submitBtn}>
          <MapPinPlus size={18} />
          Cadastrar no mapa
        </Link>
        <Link href="/lounge/mapa" className={styles.rowBtn} target="_blank">
          <ExternalLink size={15} />
          Ver mapa público
        </Link>
      </div>

      {loadError ? (
        <div className={styles.notice}>Não foi possível carregar: {loadError}</div>
      ) : null}

      {!loadError && clinics.length === 0 ? (
        <div className={styles.notice}>
          Nenhuma clínica no mapa ainda. Use &ldquo;Cadastrar no mapa&rdquo; ou
          rode a importação (<code>npm run mapagp:import</code>).
        </div>
      ) : null}

      {clinics.length > 0 ? (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Local</th>
                  <th>Tipo</th>
                  <th>Cidade</th>
                  <th>Plano</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td>
                      <strong>{clinic.nome || "Sem nome"}</strong>
                      <small>{clinic.bairro || ""}</small>
                    </td>
                    <td>
                      {clinic.tipo
                        ? typeLabels[clinic.tipo] || clinic.tipo
                        : "—"}
                    </td>
                    <td>
                      {[clinic.cidade, clinic.estado].filter(Boolean).join(" - ") ||
                        "—"}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          clinic.plano === "premium"
                            ? styles.badgeOk
                            : styles.badgeWarn
                        }`}
                      >
                        {clinic.plano || "free"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link
                          href={`/clinica/${clinic.id}`}
                          className={styles.rowBtn}
                          target="_blank"
                        >
                          <ExternalLink size={15} />
                          Ver
                        </Link>

                        <form action={deleteMapClinic}>
                          <input type="hidden" name="id" value={clinic.id} />
                          <ConfirmButton
                            className={`${styles.rowBtn} ${styles.rowBtnDanger}`}
                            message={`Excluir "${clinic.nome}" do mapa? Esta ação não pode ser desfeita.`}
                          >
                            <Trash2 size={15} />
                            Excluir
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > clinics.length ? (
            <p className={styles.lead} style={{ marginTop: 16 }}>
              Mostrando {clinics.length} de {total} locais.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
