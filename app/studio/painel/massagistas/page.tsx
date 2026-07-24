import { getOwnedClinicEditor } from "@/lib/studio/owner";
import PanelEmpty from "../PanelEmpty";
import PanelModels from "./PanelModels";

export const dynamic = "force-dynamic";

export default async function StudioPanelProfessionalsPage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  return (
    <>
      <p className="studio-kicker">Modelos</p>
      <h1>Modelos da casa</h1>
      <p className="studio-panel-lead">
        Cadastre, edite e defina quais modelos aparecem na página da sua casa.
      </p>
      <PanelModels professionals={owned.professionals} />
    </>
  );
}
