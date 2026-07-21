"use client";

import { useMemo, useState } from "react";
import { Download, MessageCircle, WandSparkles } from "lucide-react";
import type { StudioClinic } from "@/lib/studio/types";
import { buildWhatsAppUrl, getAvailableProfessionals } from "@/lib/studio/data";

export default function StatusPreview({ clinic }: { clinic: StudioClinic }) {
  const [copied, setCopied] = useState(false);
  const professionals = getAvailableProfessionals(clinic);
  const caption = useMemo(
    () =>
      `Disponiveis hoje na ${clinic.name}\nVeja nossa equipe do dia e faca sua reserva.\nWhatsApp: ${clinic.whatsapp}`,
    [clinic.name, clinic.whatsapp]
  );

  function downloadPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext("2d");

    if (!context) return;

    const gradient = context.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, "#07070a");
    gradient.addColorStop(0.45, "#5b0f1b");
    gradient.addColorStop(1, "#111118");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1080, 1920);

    context.fillStyle = "#d4af37";
    context.font = "bold 72px serif";
    context.fillText(clinic.name, 96, 220);
    context.fillStyle = "#f8f8fa";
    context.font = "bold 96px sans-serif";
    context.fillText("Disponiveis hoje", 96, 380);

    professionals.forEach((professional, index) => {
      const y = 540 + index * 220;
      context.fillStyle = "rgba(212, 175, 55, 0.16)";
      context.fillRect(96, y, 888, 150);
      context.fillStyle = "#f5d67b";
      context.font = "bold 54px sans-serif";
      context.fillText(professional.stageName, 140, y + 62);
      context.fillStyle = "#f8f8fa";
      context.font = "34px sans-serif";
      context.fillText(professional.availabilityWindow, 140, y + 116);
    });

    context.fillStyle = "#d4af37";
    context.font = "bold 44px sans-serif";
    context.fillText("Chame no WhatsApp", 96, 1780);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${clinic.slug}-status.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
  }

  return (
    <section className="studio-panel-card studio-status-grid">
      <div className="studio-status-preview">
        <span>{clinic.name}</span>
        <h2>Disponiveis hoje</h2>
        <div>
          {professionals.map((professional) => (
            <p key={professional.id}>
              <strong>{professional.stageName}</strong>
              {professional.availabilityWindow}
            </p>
          ))}
        </div>
        <small>Chame no WhatsApp</small>
      </div>
      <div>
        <p className="studio-kicker">Gerador de Status WhatsApp</p>
        <h2>Arte vertical pronta para deixar o Status mais desejado</h2>
        <p>
          Gere uma peca com clima premium, destaque a equipe do dia e publique
          com mais presenca no WhatsApp da casa.
        </p>
        <div className="studio-actions vertical">
          <button type="button" className="studio-button primary" onClick={downloadPng}>
            <Download size={17} />
            Baixar PNG
          </button>
          <button type="button" className="studio-button secondary" onClick={copyCaption}>
            <WandSparkles size={17} />
            {copied ? "Texto copiado" : "Copiar texto"}
          </button>
          <a
            className="studio-button ghost"
            href={buildWhatsAppUrl(clinic.whatsapp, caption)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} />
            Enviar para responsavel
          </a>
        </div>
      </div>
    </section>
  );
}
