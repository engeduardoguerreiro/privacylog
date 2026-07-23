"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Save, Trash2, UserRound, X } from "lucide-react";
import ImageUploader from "@/app/admin/_shared/ImageUploader";
import ConfirmButton from "../../ConfirmButton";
import styles from "../../../../admin.module.css";
import {
  deleteProfessional,
  saveProfessional,
  uploadClinicImage,
} from "../../actions";

export type Professional = {
  id: number;
  stage_name: string | null;
  slug: string | null;
  age: number | null;
  short_description: string | null;
  bio: string | null;
  main_photo_url: string | null;
  status: string | null;
  is_featured: boolean | null;
  is_public: boolean | null;
  tags: unknown;
  services: unknown;
};

function toList(value: unknown): string {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string").join(", ");
  return "";
}

function ModelForm({
  clinicId,
  professional,
  onDone,
}: {
  clinicId: number;
  professional?: Professional;
  onDone: () => void;
}) {
  const [photo, setPhoto] = useState<string[]>(
    professional?.main_photo_url ? [professional.main_photo_url] : []
  );

  return (
    <form action={saveProfessional} onSubmit={() => setTimeout(onDone, 100)}>
      <input type="hidden" name="id" value={clinicId} />
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
          <span className={styles.fieldLabel}>Status</span>
          <select
            name="status"
            defaultValue={professional?.status || "active"}
            className={styles.select}
          >
            <option value="active">Ativa</option>
            <option value="available_now">Disponível agora</option>
            <option value="available_today">Disponível hoje</option>
            <option value="booked">Agenda cheia</option>
            <option value="inactive">Inativa</option>
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
            uploadAction={uploadClinicImage}
            max={1}
            label="Enviar foto"
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

export default function ClinicModels({
  clinicId,
  professionals,
}: {
  clinicId: number;
  professionals: Professional[];
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <section className={styles.formSection}>
      <h2 className={styles.formSectionTitle}>Modelos da casa</h2>

      {professionals.length === 0 && editing !== "new" ? (
        <div className={styles.notice} style={{ marginBottom: 16 }}>
          Nenhuma modelo cadastrada. Você pode cadastrar por aqui caso a clínica
          não consiga fazer pelo painel dela.
        </div>
      ) : null}

      {professionals.length > 0 ? (
        <div className={styles.tableWrap} style={{ marginBottom: 16 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Status</th>
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
                  <td>{professional.status || "—"}</td>
                  <td>{professional.is_public === false ? "Não" : "Sim"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.rowBtn}
                        onClick={() =>
                          setEditing(
                            editing === professional.id ? null : professional.id
                          )
                        }
                      >
                        {editing === professional.id ? "Fechar" : "Editar"}
                      </button>

                      <form action={deleteProfessional}>
                        <input type="hidden" name="id" value={clinicId} />
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
            clinicId={clinicId}
            professional={professionals.find((item) => item.id === editing)}
            onDone={() => setEditing(null)}
          />
        </div>
      ) : null}

      {editing === "new" ? (
        <div className={styles.planCard} style={{ marginBottom: 16 }}>
          <ModelForm clinicId={clinicId} onDone={() => setEditing(null)} />
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
