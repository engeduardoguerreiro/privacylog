"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Save, Trash2, UserRound, X } from "lucide-react";
import ImageUploader from "@/app/admin/_shared/ImageUploader";
import ConfirmButton from "@/app/admin/studio/clinicas/ConfirmButton";
import styles from "@/app/admin/admin.module.css";
import type { OwnedProfessional } from "@/lib/studio/owner";
import {
  deleteOwnProfessional,
  saveOwnProfessional,
  uploadOwnImage,
} from "../actions";

function toList(value: unknown): string {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string").join(", ");
  return "";
}

const statusOptions = [
  { value: "available_now", label: "Disponível agora" },
  { value: "available_today", label: "Disponível hoje" },
  { value: "booked", label: "Agenda cheia" },
  { value: "unavailable", label: "Indisponível" },
];

function ModelForm({
  professional,
  onDone,
}: {
  professional?: OwnedProfessional;
  onDone: () => void;
}) {
  const [photo, setPhoto] = useState<string[]>(
    professional?.main_photo_url ? [professional.main_photo_url] : []
  );

  return (
    <form action={saveOwnProfessional} onSubmit={() => setTimeout(onDone, 100)}>
      {professional ? (
        <input type="hidden" name="professional_id" value={professional.id} />
      ) : null}
      <input type="hidden" name="main_photo_url" value={photo[0] || ""} />

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Nome *</span>
          <input
            name="stage_name"
            defaultValue={professional?.stage_name || ""}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Idade</span>
          <input
            name="age"
            type="number"
            min={18}
            max={99}
            defaultValue={professional?.age ?? ""}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Disponibilidade</span>
          <select
            name="status"
            defaultValue={professional?.status || "available_today"}
            className={styles.select}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.fieldLabel}>Descrição curta</span>
          <input
            name="short_description"
            defaultValue={professional?.short_description || ""}
            className={styles.input}
          />
        </label>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.fieldLabel}>Bio</span>
          <textarea
            name="bio"
            defaultValue={professional?.bio || ""}
            className={styles.textarea}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tags (separadas por vírgula)</span>
          <input
            name="tags"
            defaultValue={toList(professional?.tags)}
            placeholder="VIP, Relaxante"
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Serviços (separados por vírgula)</span>
          <input
            name="services"
            defaultValue={toList(professional?.services)}
            placeholder="Massagem relaxante"
            className={styles.input}
          />
        </label>

        <label className={styles.checkField}>
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={professional?.is_featured === true}
          />
          Em destaque
        </label>

        <label className={styles.checkField}>
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={professional?.is_public !== false}
          />
          Visível no site
        </label>

        <div className={styles.fieldFull}>
          <span className={styles.fieldLabel}>Foto</span>
          <ImageUploader
            value={photo}
            onChange={setPhoto}
            uploadAction={uploadOwnImage}
            max={1}
            label="Enviar foto"
            targetWidth={900}
            targetHeight={1600}
          />
        </div>
      </div>

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submitBtn}>
          <Save size={18} />
          {professional ? "Salvar modelo" : "Adicionar modelo"}
        </button>
        <button type="button" className={styles.rowBtn} onClick={onDone}>
          <X size={15} />
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function PanelModels({
  professionals,
}: {
  professionals: OwnedProfessional[];
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <section className={styles.formSection}>
      {professionals.length === 0 && editing !== "new" ? (
        <div className={styles.notice} style={{ marginBottom: 16 }}>
          Você ainda não cadastrou modelos. Clique em “Adicionar modelo”.
        </div>
      ) : null}

      {professionals.length > 0 ? (
        <div className={styles.tableWrap} style={{ marginBottom: 16 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Disponibilidade</th>
                <th>Visível</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((professional) => (
                <tr key={professional.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={styles.modelAvatar}>
                        {professional.main_photo_url ? (
                          <Image
                            src={professional.main_photo_url}
                            alt=""
                            fill
                            sizes="44px"
                          />
                        ) : (
                          <UserRound size={18} />
                        )}
                      </span>
                      <div>
                        <strong>{professional.stage_name || "Sem nome"}</strong>
                        <small>{professional.short_description || ""}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {statusOptions.find((o) => o.value === professional.status)?.label ||
                      "—"}
                  </td>
                  <td>{professional.is_public === false ? "Não" : "Sim"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.rowBtn}
                        onClick={() =>
                          setEditing(editing === professional.id ? null : professional.id)
                        }
                      >
                        {editing === professional.id ? "Fechar" : "Editar"}
                      </button>

                      <form action={deleteOwnProfessional}>
                        <input
                          type="hidden"
                          name="professional_id"
                          value={professional.id}
                        />
                        <ConfirmButton
                          className={`${styles.rowBtn} ${styles.rowBtnDanger}`}
                          message={`Excluir "${professional.stage_name}"?`}
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
      ) : null}

      {typeof editing === "number" ? (
        <div className={styles.planCard} style={{ marginBottom: 16 }}>
          <ModelForm
            professional={professionals.find((item) => item.id === editing)}
            onDone={() => setEditing(null)}
          />
        </div>
      ) : null}

      {editing === "new" ? (
        <div className={styles.planCard} style={{ marginBottom: 16 }}>
          <ModelForm onDone={() => setEditing(null)} />
        </div>
      ) : (
        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => setEditing("new")}
        >
          <Plus size={18} />
          Adicionar modelo
        </button>
      )}
    </section>
  );
}
