"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import styles from "../admin.module.css";

// Todas as imagens saem no mesmo tamanho (corte "cover" centralizado),
// para os cards e galerias ficarem uniformes. As dimensoes-alvo sao
// configuraveis (ex.: 9:16 para as fotos de modelo).
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;
const QUALITY = 0.85;

async function resizeToStandard(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  const scale = Math.max(
    targetWidth / bitmap.width,
    targetHeight / bitmap.height
  );
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(
    bitmap,
    (targetWidth - drawWidth) / 2,
    (targetHeight - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
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
  uploadAction,
  max = 3,
  label = "Adicionar imagem",
  targetWidth = DEFAULT_WIDTH,
  targetHeight = DEFAULT_HEIGHT,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  uploadAction: (formData: FormData) => Promise<string>;
  max?: number;
  label?: string;
  targetWidth?: number;
  targetHeight?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = max - value.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    const selected = Array.from(files);

    if (selected.length > remaining) {
      setError(
        `Você pode enviar no máximo ${max} ${
          max === 1 ? "imagem" : "imagens"
        }. ${remaining > 0 ? `Restam ${remaining}.` : ""}`
      );
      return;
    }

    setBusy(true);

    try {
      const uploaded: string[] = [];

      for (const file of selected) {
        const blob = await resizeToStandard(file, targetWidth, targetHeight);
        const payload = new FormData();
        payload.append(
          "file",
          new File([blob], "imagem.webp", { type: "image/webp" })
        );

        uploaded.push(await uploadAction(payload));
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

  return (
    <div>
      <div className={styles.uploadGrid}>
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className={styles.uploadThumb}>
            <Image src={url} alt="" fill sizes="180px" />
            <button
              type="button"
              onClick={() =>
                onChange(value.filter((_, position) => position !== index))
              }
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
                {label}
              </>
            )}
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />

      <p className={styles.uploadHint}>
        {max === 1 ? "1 imagem." : `Até ${max} imagens.`} Todas são recortadas
        automaticamente para {targetWidth}×{targetHeight}.
      </p>

      {error ? <div className={styles.feedbackErr}>{error}</div> : null}
    </div>
  );
}
