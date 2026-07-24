import StatusPreview from "@/components/studio/StatusPreview";
import { getStudioClinicForCurrentUser } from "@/lib/studio/owner";
import PanelEmpty from "../PanelEmpty";

export const dynamic = "force-dynamic";

export default async function StudioPanelWhatsappStatusPage() {
  const clinic = await getStudioClinicForCurrentUser();

  if (!clinic) {
    return <PanelEmpty />;
  }

  return (
    <>
      <p className="studio-kicker">WhatsApp Status</p>
      <h1>Gerador de arte do dia</h1>
      <StatusPreview clinic={clinic} />
    </>
  );
}
