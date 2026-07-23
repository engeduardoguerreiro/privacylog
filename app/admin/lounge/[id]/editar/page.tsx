import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../../../admin.module.css";
import MapClinicForm, { type MapClinicValues } from "../../MapClinicForm";

export const dynamic = "force-dynamic";

export default async function EditMapClinicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clinicId = Number(id);

  if (!Number.isFinite(clinicId)) {
    notFound();
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return (
      <div className={styles.notice}>
        SUPABASE_SERVICE_ROLE_KEY não configurada.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("clinicas")
    .select("*")
    .eq("id", clinicId)
    .maybeSingle();

  if (error) {
    return (
      <div className={styles.notice}>
        Não foi possível carregar: {error.message}
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const clinic = data as MapClinicValues;

  return (
    <div>
      <Link href="/admin/lounge" className={styles.rowBtn}>
        <ArrowLeft size={15} />
        Voltar para as clínicas do mapa
      </Link>

      <p className={styles.kicker} style={{ marginTop: 20 }}>
        Mapa
      </p>
      <h1 className={styles.pageTitle}>Editar {clinic.nome || "clínica"}</h1>
      <p className={styles.lead}>
        Altere os dados e salve. As mudanças aparecem no mapa público.
      </p>

      <MapClinicForm clinic={clinic} />
    </div>
  );
}
