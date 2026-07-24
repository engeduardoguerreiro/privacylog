import { getOwnedClinicEditor } from "@/lib/studio/owner";
import { updateOwnClinic } from "../actions";
import PanelEmpty from "../PanelEmpty";

export const dynamic = "force-dynamic";

function str(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function listToText(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").join(", ")
    : "";
}

function hoursToText(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const item = entry as Record<string, unknown>;
      const day = typeof item.day === "string" ? item.day : "";
      const hours = typeof item.hours === "string" ? item.hours : "";
      return day ? `${day}: ${hours}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

export default async function StudioPanelProfilePage() {
  const owned = await getOwnedClinicEditor();

  if (!owned) {
    return <PanelEmpty />;
  }

  const c = owned.clinic;

  return (
    <>
      <p className="studio-kicker">Perfil da casa</p>
      <h1>Dados públicos</h1>
      <p className="studio-panel-lead">
        É o que aparece na página da sua casa. As alterações entram no ar ao salvar.
      </p>

      <form action={updateOwnClinic} className="studio-panel-card">
        <div className="studio-form">
          <label>
            Nome da casa
            <input name="name" defaultValue={str(c.name)} required />
          </label>

          <label>
            Descrição curta
            <input name="short_description" defaultValue={str(c.short_description)} />
          </label>

          <label>
            Descrição
            <textarea name="description" rows={5} defaultValue={str(c.description)} />
          </label>

          <div className="studio-form-grid">
            <label>
              Cidade
              <input name="city" defaultValue={str(c.city)} />
            </label>
            <label>
              Estado
              <input name="state" maxLength={2} defaultValue={str(c.state)} />
            </label>
            <label>
              Bairro
              <input name="neighborhood" defaultValue={str(c.neighborhood)} />
            </label>
            <label>
              Endereço
              <input name="address" defaultValue={str(c.address)} />
            </label>
          </div>

          <div className="studio-form-grid">
            <label>
              WhatsApp
              <input name="whatsapp" defaultValue={str(c.whatsapp)} placeholder="5511999999999" />
            </label>
            <label>
              Telefone
              <input name="phone" defaultValue={str(c.phone)} />
            </label>
            <label>
              Instagram
              <input name="instagram" defaultValue={str(c.instagram)} />
            </label>
            <label>
              Site
              <input name="website" defaultValue={str(c.website)} />
            </label>
          </div>

          <label>
            Horários — uma linha por dia (ex.: “Segunda: 11:00 as 23:00”)
            <textarea
              name="opening_hours"
              rows={4}
              defaultValue={hoursToText(c.opening_hours)}
              placeholder={"Segunda: 11:00 as 23:00\nTerça: 11:00 as 23:00"}
            />
          </label>

          <div className="studio-form-grid">
            <label>
              Serviços (separados por vírgula)
              <input
                name="services"
                defaultValue={listToText(c.services)}
                placeholder="Massagens, Lounges privativos"
              />
            </label>
            <label>
              Formas de pagamento (separadas por vírgula)
              <input
                name="payment_methods"
                defaultValue={listToText(c.payment_methods)}
                placeholder="PIX, Cartão, Dinheiro"
              />
            </label>
          </div>

          <label>
            Regras da casa
            <textarea name="rules" rows={3} defaultValue={str(c.rules)} />
          </label>

          <button type="submit" className="studio-button primary">
            Salvar perfil
          </button>
        </div>
      </form>
    </>
  );
}
