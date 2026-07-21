"use client";

import { useEffect } from "react";

const MAX_WIDTH = 1400;
const MAX_HEIGHT = 1800;
const JPEG_QUALITY = 0.84;
const TARGET_BYTES = 1.6 * 1024 * 1024;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nao foi possivel ler a imagem."));
    };
    image.src = url;
  });
}

function resizeBounds(width: number, height: number) {
  const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Nao foi possivel otimizar a imagem."));
      },
      "image/jpeg",
      quality
    );
  });
}

async function optimizeFile(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= TARGET_BYTES) {
    return file;
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const { width, height } = resizeBounds(image.naturalWidth || image.width, image.naturalHeight || image.height);
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return file;
  }

  context.fillStyle = "#07070a";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, JPEG_QUALITY);

  if (blob.size >= file.size) {
    return file;
  }

  const name = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${name}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function replaceInputFile(input: HTMLInputElement, file: File) {
  const files = new DataTransfer();
  files.items.add(file);
  input.files = files.files;
}

export default function ClinicProfessionalFormEnhancer() {
  useEffect(() => {
    async function handleSubmit(event: SubmitEvent) {
      const form = event.target;

      if (!(form instanceof HTMLFormElement) || !form.classList.contains("clinic-admin-form")) {
        return;
      }

      if (form.dataset.imagesOptimized === "true") {
        delete form.dataset.imagesOptimized;
        return;
      }

      const fileInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"][accept^="image"]'));
      const selectedInputs = fileInputs.filter((input) => input.files?.[0]);

      if (selectedInputs.length === 0) {
        return;
      }

      event.preventDefault();

      for (const input of selectedInputs) {
        const file = input.files?.[0];

        if (!file) {
          continue;
        }

        replaceInputFile(input, await optimizeFile(file));
      }

      form.dataset.imagesOptimized = "true";
      form.requestSubmit();
    }

    document.addEventListener("submit", handleSubmit, true);

    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);

  return null;
}
