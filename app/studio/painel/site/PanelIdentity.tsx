"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import ImageUploader from "@/app/admin/_shared/ImageUploader";
import styles from "@/app/admin/admin.module.css";
import { clinicThemes } from "@/lib/studio/themes";
import { saveOwnIdentity, uploadOwnImage } from "../actions";

export default function PanelIdentity({
  logoUrl,
  coverUrl,
  theme,
}: {
  logoUrl: string;
  coverUrl: string;
  theme: string;
}) {
  const [logo, setLogo] = useState<string[]>(logoUrl ? [logoUrl] : []);
  const [cover, setCover] = useState<string[]>(coverUrl ? [coverUrl] : []);
  const [selected, setSelected] = useState(theme || "champagne");

  return (
    <form action={saveOwnIdentity} className={styles.formSection}>
      <input type="hidden" name="logo_url" value={logo[0] || ""} />
      <input type="hidden" name="main_image_url" value={cover[0] || ""} />
      <input type="hidden" name="theme" value={selected} />

      <p className={styles.fieldLabel} style={{ marginBottom: 10 }}>
        Logotipo da casa
      </p>
      <ImageUploader
        value={logo}
        onChange={setLogo}
        uploadAction={uploadOwnImage}
        max={1}
        label="Enviar logotipo"
      />

      <p className={styles.fieldLabel} style={{ margin: "24px 0 10px" }}>
        Imagem de capa (topo da página)
      </p>
      <ImageUploader
        value={cover}
        onChange={setCover}
        uploadAction={uploadOwnImage}
        max={1}
        label="Enviar capa"
      />

      <p className={styles.fieldLabel} style={{ margin: "24px 0 10px" }}>
        Tema de cores da página
      </p>
      <div className={styles.themeGrid}>
        {clinicThemes.map((option) => {
          const active = selected === option.slug;

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => setSelected(option.slug)}
              className={`${styles.themeCard} ${active ? styles.themeCardActive : ""}`}
              style={{ background: option.background, borderColor: option.line }}
              aria-pressed={active}
            >
              <span className={styles.themeSwatches}>
                <i style={{ background: option.accent }} />
                <i style={{ background: option.accentStrong }} />
                <i style={{ background: option.surface, borderColor: option.line }} />
              </span>
              <strong style={{ color: option.ink }}>{option.name}</strong>
              <small style={{ color: option.muted }}>{option.description}</small>
              {active ? (
                <span className={styles.themeCheck} style={{ background: option.accentStrong }}>
                  <Check size={13} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className={styles.submitRow} style={{ marginTop: 20 }}>
        <button type="submit" className={styles.submitBtn}>
          <Save size={18} />
          Salvar identidade
        </button>
      </div>
    </form>
  );
}
