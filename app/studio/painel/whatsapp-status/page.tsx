import StatusPreview from "@/components/studio/StatusPreview";
import { studioClinics } from "@/lib/studio/data";

export default function StudioPanelWhatsappStatusPage() {
  return (
    <>
      <p className="studio-kicker">WhatsApp Status</p>
      <h1>Gerador de arte do dia</h1>
      <StatusPreview clinic={studioClinics[0]} />
    </>
  );
}
