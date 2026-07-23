"use client";

import { useState } from "react";
import { MapPinPlus, Save } from "lucide-react";
import styles from "../admin.module.css";
import ImageUploader from "./ImageUploader";
import { saveMapClinic } from "./actions";

export type MapClinicValues = {
  id?: number;
  nome?: string | null;
  descricao?: string | null;
  contato?: string | null;
  site?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  preco_30_normal?: number | string | null;
  preco_30_forista?: number | string | null;
  preco_60_normal?: number | string | null;
  preco_60_forista?: number | string | null;
  tipo?: string | null;
  plano?: string | null;
  horarios?: unknown;
  imagens?: unknown;
};

function parseImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function readHour(horarios: unknown, day: string, edge: "open" | "close") {
  if (!horarios || typeof horarios !== "object") return "";
  const source = horarios as Record<string, unknown>;
  const entry = source[day];
  if (!Array.isArray(entry) || !entry[0]) return "";
  const slot = entry[0] as Record<string, unknown>;
  const value = slot[edge];
  return typeof value === "string" ? value : "";
}

function str(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

export default function MapClinicForm({
  clinic,
}: {
  clinic?: MapClinicValues;
}) {
  const editing = Boolean(clinic?.id);
  const [images, setImages] = useState<string[]>(parseImages(clinic?.imagens));

  function field(
    name: keyof MapClinicValues,
    label: string,
    placeholder = "",
    full = false
  ) {
    return (
      <label className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
        <span className={styles.fieldLabel}>{label}</span>
        <input
          name={name}
          defaultValue={str(clinic?.[name])}
          placeholder={placeholder}
          className={styles.input}
        />
      </label>
    );
  }

  return (
    <form action={saveMapClinic}>
      {editing ? <input type="hidden" name="id" value={clinic?.id} /> : null}
      <input type="hidden" name="imagens" value={JSON.stringify(images)} />

      <section className={styles.formSection}>
        <h2 className={styles.formSectionTitle}>Dados da casa</h2>
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Nome do local *</span>
            <input
              name="nome"
              defaultValue={str(clinic?.nome)}
              placeholder="Ex.: Clínica Aurora"
              className={styles.input}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Tipo</span>
            <select
              name="tipo"
              defaultValue={str(clinic?.tipo) || "clinica"}
              className={styles.select}
            >
              <option value="clinica">Clínica</option>
              <option value="massagem">Massagem</option>
              <option value="boate">Boate</option>
              <option value="prive">Privê</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Plano</span>
            <select
              name="plano"
              defaultValue={str(clinic?.plano) || "free"}
              className={styles.select}
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          {field("contato", "WhatsApp / contato", "5511999999999")}
          {field("site", "Site", "https://...")}

          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Descrição</span>
            <textarea
              name="descricao"
              defaultValue={str(clinic?.descricao)}
              placeholder="Breve descrição da casa"
              className={styles.textarea}
            />
          </label>
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.formSectionTitle}>Localização</h2>
        <div className={styles.formGrid}>
          {field("endereco", "Endereço", "Rua, número", true)}
          {field("bairro", "Bairro")}
          {field("cidade", "Cidade")}

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Estado</span>
            <select
              name="estado"
              defaultValue={str(clinic?.estado) || "SP"}
              className={styles.select}
            >
              <option value="SP">São Paulo</option>
              <option value="MG">Minas Gerais</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="PR">Paraná</option>
              <option value="SC">Santa Catarina</option>
              <option value="RS">Rio Grande do Sul</option>
            </select>
          </label>

          {field("lat", "Latitude", "-23.5617")}
          {field("lng", "Longitude", "-46.6559")}
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.formSectionTitle}>Preços</h2>
        <div className={styles.formGrid}>
          {field("preco_30_normal", "30 min — normal", "150")}
          {field("preco_30_forista", "30 min — forista", "130")}
          {field("preco_60_normal", "60 min — normal", "250")}
          {field("preco_60_forista", "60 min — forista", "220")}
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.formSectionTitle}>Horários</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Seg–Sex abre</span>
            <input
              name="weekday_open"
              defaultValue={readHour(clinic?.horarios, "weekday", "open")}
              placeholder="10:00"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Seg–Sex fecha</span>
            <input
              name="weekday_close"
              defaultValue={readHour(clinic?.horarios, "weekday", "close")}
              placeholder="22:00"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Sábado abre</span>
            <input
              name="saturday_open"
              defaultValue={readHour(clinic?.horarios, "saturday", "open")}
              placeholder="10:00"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Sábado fecha</span>
            <input
              name="saturday_close"
              defaultValue={readHour(clinic?.horarios, "saturday", "close")}
              placeholder="20:00"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Domingo abre</span>
            <input
              name="sunday_open"
              defaultValue={readHour(clinic?.horarios, "sunday", "open")}
              placeholder="10:00"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Domingo fecha</span>
            <input
              name="sunday_close"
              defaultValue={readHour(clinic?.horarios, "sunday", "close")}
              placeholder="18:00"
              className={styles.input}
            />
          </label>
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.formSectionTitle}>Imagens</h2>
        <ImageUploader value={images} onChange={setImages} />
      </section>

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submitBtn}>
          {editing ? <Save size={18} /> : <MapPinPlus size={18} />}
          {editing ? "Salvar alterações" : "Cadastrar no mapa"}
        </button>
      </div>
    </form>
  );
}
