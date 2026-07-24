import { getOwnedClinicEditor } from "@/lib/studio/owner";
import PanelEmpty from "../PanelEmpty";
import PanelPhotos from "./PanelPhotos";

export const dynamic = "force-dynamic";

export default async function StudioPanelPhotosPage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  return (
    <>
      <p className="studio-kicker">Fotos do ambiente</p>
      <h1>Galeria da casa</h1>
      <p className="studio-panel-lead">
        Até 8 fotos do ambiente. Elas são redimensionadas automaticamente para
        ficarem uniformes na página da casa.
      </p>
      <PanelPhotos photos={owned.photos} />
    </>
  );
}
