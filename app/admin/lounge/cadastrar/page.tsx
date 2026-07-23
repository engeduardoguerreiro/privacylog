"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { MapPinPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../../admin.module.css";

type FormState = {
  nome: string;
  descricao: string;
  contato: string;
  site: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  lat: string;
  lng: string;
  preco_30_normal: string;
  preco_30_forista: string;
  preco_60_normal: string;
  preco_60_forista: string;
  tipo: string;
  plano: string;
  weekday_open: string;
  weekday_close: string;
  saturday_open: string;
  saturday_close: string;
  sunday_open: string;
  sunday_close: string;
  imagens: string;
};

const initialForm: FormState = {
  nome: "",
  descricao: "",
  contato: "",
  site: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "SP",
  lat: "",
  lng: "",
  preco_30_normal: "",
  preco_30_forista: "",
  preco_60_normal: "",
  preco_60_forista: "",
  tipo: "clinica",
  plano: "free",
  weekday_open: "",
  weekday_close: "",
  saturday_open: "",
  saturday_close: "",
  sunday_open: "",
  sunday_close: "",
  imagens: "",
};

export default function AdminMapRegisterPage() {
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "ok" | "err"; text: string } | null
  >(null);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const imagensArray = form.imagens
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);

    const novaClinica = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      contato: form.contato.trim(),
      site: form.site.trim() || null,
      endereco: form.endereco.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado,
      lat: Number(form.lat),
      lng: Number(form.lng),
      preco_30_normal: Number(form.preco_30_normal) || null,
      preco_30_forista: Number(form.preco_30_forista) || null,
      preco_60_normal: Number(form.preco_60_normal) || null,
      preco_60_forista: Number(form.preco_60_forista) || null,
      tipo: form.tipo,
      plano: form.plano,
      horarios: {
        weekday: [{ open: form.weekday_open, close: form.weekday_close }],
        saturday: [{ open: form.saturday_open, close: form.saturday_close }],
        sunday: [{ open: form.sunday_open, close: form.sunday_close }],
      },
      imagens: JSON.stringify(imagensArray, null, 2),
    };

    const { error } = await supabase.from("clinicas").insert([novaClinica]);

    if (error) {
      setFeedback({ type: "err", text: `Erro ao cadastrar: ${error.message}` });
      setSaving(false);
      return;
    }

    setFeedback({
      type: "ok",
      text: `"${novaClinica.nome}" foi cadastrada no mapa.`,
    });
    setForm(initialForm);
    setSaving(false);
  }

  function field(
    name: keyof FormState,
    label: string,
    placeholder = "",
    full = false
  ) {
    return (
      <label className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
        <span className={styles.fieldLabel}>{label}</span>
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={styles.input}
        />
      </label>
    );
  }

  return (
    <div>
      <p className={styles.kicker}>Mapa</p>
      <h1 className={styles.pageTitle}>Cadastrar clínica no mapa</h1>
      <p className={styles.lead}>
        Estas clínicas aparecem no mapa global e não dependem de assinatura.
      </p>

      <form onSubmit={handleSubmit}>
        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Dados da casa</h2>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>Nome do local *</span>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex.: Clínica Aurora"
                className={styles.input}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Tipo</span>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
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
                value={form.plano}
                onChange={handleChange}
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
                value={form.descricao}
                onChange={handleChange}
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
                value={form.estado}
                onChange={handleChange}
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
            {field("weekday_open", "Seg–Sex abre", "10:00")}
            {field("weekday_close", "Seg–Sex fecha", "22:00")}
            {field("saturday_open", "Sábado abre", "10:00")}
            {field("saturday_close", "Sábado fecha", "20:00")}
            {field("sunday_open", "Domingo abre", "10:00")}
            {field("sunday_close", "Domingo fecha", "18:00")}
          </div>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Imagens</h2>
          <div className={styles.formGrid}>
            {field(
              "imagens",
              "Caminhos separados por vírgula",
              "/clinicas/1_01.webp, /clinicas/1_02.webp",
              true
            )}
          </div>
        </section>

        <div className={styles.submitRow}>
          <button type="submit" disabled={saving} className={styles.submitBtn}>
            <MapPinPlus size={18} />
            {saving ? "Salvando..." : "Cadastrar no mapa"}
          </button>

          {feedback ? (
            <span
              className={
                feedback.type === "ok" ? styles.feedbackOk : styles.feedbackErr
              }
            >
              {feedback.text}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
