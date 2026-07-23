import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../../../../admin.module.css";
import { updateClinic } from "../../actions";
import ClinicMedia from "./ClinicMedia";
import ClinicModels, { type Professional } from "./ClinicModels";

export const dynamic = "force-dynamic";

type Clinic = Record<string, unknown> & { id: number };

function str(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function listToText(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").join(", ")
    : "";
}

function hoursToText(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const item = entry as Record<string, unknown>;
      const day = typeof item.day === "string" ? item.day : "";
      const hours = typeof item.hours === "string" ? item.hours : "";
      return day ? `${day}: ${hours}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

export default async function EditClinicPage({
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
    .from("studio_clinics")
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

  const clinic = data as Clinic;

  const [photosResult, professionalsResult] = await Promise.all([
    supabase
      .from("studio_clinic_photos")
      .select("image_url")
      .eq("clinic_id", clinicId)
      .order("position", { ascending: true }),
    supabase
      .from("studio_professionals")
      .select(
        "id, stage_name, slug, age, short_description, bio, main_photo_url, status, is_featured, is_public, tags, services"
      )
      .eq("clinic_id", clinicId)
      .order("id", { ascending: true }),
  ]);

  const photos = (photosResult.data || [])
    .map((row) => (row as { image_url?: string }).image_url)
    .filter((url): url is string => typeof url === "string");

  const professionals = (professionalsResult.data || []) as Professional[];
  const openingHoursText = hoursToText(clinic.opening_hours);

  function field(name: string, label: string, placeholder = "", full = false) {
    return (
      <label className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
        <span className={styles.fieldLabel}>{label}</span>
        <input
          name={name}
          defaultValue={str(clinic[name])}
          placeholder={placeholder}
          className={styles.input}
        />
      </label>
    );
  }

  return (
    <div>
      <Link href="/admin/studio/clinicas" className={styles.rowBtn}>
        <ArrowLeft size={15} />
        Voltar para as clínicas
      </Link>

      <p className={styles.kicker} style={{ marginTop: 20 }}>
        Clínicas assinantes
      </p>
      <h1 className={styles.pageTitle}>Editar {str(clinic.name)}</h1>
      <p className={styles.lead}>
        Dados da casa assinante. As fotos e as modelos são gerenciadas pela
        própria clínica no painel dela.
      </p>

      <form action={updateClinic}>
        <input type="hidden" name="id" value={clinic.id} />

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Identificação</h2>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Nome *</span>
              <input
                name="name"
                defaultValue={str(clinic.name)}
                className={styles.input}
                required
              />
            </label>

            {field("slug", "Slug (endereço na URL)", "maison-aurora")}

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Tipo</span>
              <select
                name="business_type"
                defaultValue={str(clinic.business_type) || "clinica"}
                className={styles.select}
              >
                <option value="clinica">Clínica</option>
                <option value="lounge">Lounge</option>
                <option value="spa">Spa</option>
                <option value="prive">Privê</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Descrição curta</span>
              <input
                name="short_description"
                defaultValue={str(clinic.short_description)}
                className={styles.input}
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Descrição</span>
              <textarea
                name="description"
                defaultValue={str(clinic.description)}
                className={styles.textarea}
              />
            </label>
          </div>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Localização e contato</h2>
          <div className={styles.formGrid}>
            {field("address", "Endereço", "", true)}
            {field("neighborhood", "Bairro")}
            {field("city", "Cidade")}
            {field("state", "Estado", "SP")}
            {field("whatsapp", "WhatsApp", "5511999999999")}
            {field("phone", "Telefone")}
            {field("instagram", "Instagram")}
            {field("website", "Site")}
          </div>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Operação</h2>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>
                Horários — uma linha por dia, no formato &ldquo;Segunda: 11:00 as 23:00&rdquo;
              </span>
              <textarea
                name="opening_hours"
                defaultValue={openingHoursText}
                className={styles.textarea}
                placeholder={"Segunda: 11:00 as 23:00\nTerça: 11:00 as 23:00"}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Serviços (separados por vírgula)
              </span>
              <input
                name="services"
                defaultValue={listToText(clinic.services)}
                placeholder="Massagens, Lounges privativos"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Formas de pagamento (separadas por vírgula)
              </span>
              <input
                name="payment_methods"
                defaultValue={listToText(clinic.payment_methods)}
                placeholder="PIX, Cartão, Dinheiro"
                className={styles.input}
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Regras da casa</span>
              <textarea
                name="rules"
                defaultValue={str(clinic.rules)}
                className={styles.textarea}
              />
            </label>
          </div>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Imagens principais</h2>
          <div className={styles.formGrid}>
            {field("logo_url", "URL do logo", "/brand/...")}
            {field("main_image_url", "URL da imagem principal", "/clinicas/...")}
          </div>
          <p className={styles.uploadHint}>
            Para a galeria da casa, use a seção “Fotos da casa” abaixo (com
            upload e redimensionamento automático).
          </p>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Plano e situação</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Plano</span>
              <select
                name="plan"
                defaultValue={str(clinic.plan) || "essential"}
                className={styles.select}
              >
                <option value="essential">Essencial</option>
                <option value="premium">Premium</option>
                <option value="black">Black</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <select
                name="status"
                defaultValue={str(clinic.status) || "pending"}
                className={styles.select}
              >
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
                <option value="suspended">Suspensa</option>
              </select>
            </label>

            <label className={styles.checkField}>
              <input
                type="checkbox"
                name="is_partner"
                defaultChecked={clinic.is_partner === true}
              />
              Parceira
            </label>

            <label className={styles.checkField}>
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={clinic.is_featured === true}
              />
              Em destaque
            </label>

            <label className={styles.checkField}>
              <input
                type="checkbox"
                name="is_verified"
                defaultChecked={clinic.is_verified === true}
              />
              Verificada
            </label>
          </div>
        </section>

        <div className={styles.submitRow}>
          <button type="submit" className={styles.submitBtn}>
            <Save size={18} />
            Salvar alterações
          </button>

          {clinic.slug ? (
            <Link
              href={`/studio/clinicas/${str(clinic.slug)}`}
              className={styles.rowBtn}
              target="_blank"
            >
              <ExternalLink size={15} />
              Ver página pública
            </Link>
          ) : null}
        </div>
      </form>

      <ClinicMedia clinicId={clinicId} photos={photos} />

      <ClinicModels clinicId={clinicId} professionals={professionals} />
    </div>
  );
}
