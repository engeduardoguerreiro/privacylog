import MapClinicForm from "../MapClinicForm";
import styles from "../../admin.module.css";

export default function AdminMapRegisterPage() {
  return (
    <div>
      <p className={styles.kicker}>Mapa</p>
      <h1 className={styles.pageTitle}>Cadastrar clínica no mapa</h1>
      <p className={styles.lead}>
        Estas clínicas aparecem no mapa global e não dependem de assinatura.
      </p>

      <MapClinicForm />
    </div>
  );
}
