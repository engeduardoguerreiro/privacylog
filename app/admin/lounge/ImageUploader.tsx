"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import styles from "../admin.module.css";
import { uploadMapClinicImage } from "./actions";

export const MAX_IMAGES = 3;

// Todas as imagens saem no mesmo tamanho (corte "cover" centralizado),
// para o mapa e os cards ficarem uniformes.
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 800;
const QUALITY = 0.85;

async function resizeToStandard(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  // corte "cover": preenche todo o quadro sem distorcer
  const scale = Math.max(
    TARGET_WIDTH / bitmap.width,
    TARGET_HEIGHT / bitmap.height
  );
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const offsetX = (TARGET_WIDTH - drawWidth) / 2;
  const offsetY = (TARGET_HEIGHT - drawHeight) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  ctx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem.")),
      "image/webp",
      QUALITY
    );
  });
}

export default function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_IMAGES - value.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);

    const selected = Array.from(files);

    if (selected.length > remaining) {
      setError(
        `Você pode enviar no máximo ${MAX_IMAGES} imagens. Restam ${remaining}.`
      );
      return;
    }

    setBusy(true);

    try {
      const uploaded: string[] = [];

      for (const file of selected) {
        const blob = await resizeToStandard(file);
        const payload = new FormData();
        payload.append("file", new File([blob], "imagem.webp", { type: "image/webp" }));

        const url = await uploadMapClinicImage(payload);
        uploaded.push(url);
      }

      onChange([...value, ...uploaded]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem."
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, position) => position !== index));
  }

  return (
    <div>
      <div className={styles.uploadGrid}>
        {value.map((url, index) => (
          <div key={url} className={styles.uploadThumb}>
            <Image src={url} alt="" fill sizes="180px" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remover imagem"
            >
              <X size={15} />
            </button>
          </div>
        ))}

        {remaining > 0 ? (
          <button
            type="button"
            className={styles.uploadBox}
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 size={20} className={styles.spin} />
                Enviando...
              </>
            ) : (
              <>
                <ImagePlus size={20} />
                Adicionar imagem
              </>
            )}
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />

      <p className={styles.uploadHint}>
        Até {MAX_IMAGES} imagens. Todas são recortadas automaticamente para{" "}
        {TARGET_WIDTH}×{TARGET_HEIGHT} para ficarem uniformes.
      </p>

      {error ? <div className={styles.feedbackErr}>{error}</div> : null}
    </div>
  );
}
