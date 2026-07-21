import { submitStudioLead } from "@/app/studio/actions";
import { studioPlans } from "@/lib/studio/data";

export default function LeadForm({
  status,
  defaultPlan = "premium",
}: {
  status?: string;
  defaultPlan?: string;
}) {
  return (
    <div className="studio-lead-card">
      {status ? <StatusMessage status={status} /> : null}
      <form action={submitStudioLead} className="studio-form">
        <label>
          Nome da clinica
          <input name="clinic_name" required placeholder="Nome da sua casa" />
        </label>
        <label>
          Responsavel
          <input name="responsible_name" required placeholder="Nome do responsavel" />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" required placeholder="5511999999999" />
        </label>
        <div className="studio-form-grid">
          <label>
            Cidade
            <input name="city" placeholder="Sao Paulo" />
          </label>
          <label>
            Bairro
            <input name="neighborhood" placeholder="Jardins" />
          </label>
        </div>
        <div className="studio-form-grid">
          <label>
            Tipo de estabelecimento
            <select name="business_type" defaultValue="clinica">
              <option value="clinica">Clinica</option>
              <option value="prive">Prive</option>
              <option value="lounge">Lounge</option>
              <option value="spa">Spa</option>
              <option value="casa">Casa</option>
            </select>
          </label>
          <label>
            Profissionais em media
            <input name="professionals_count" type="number" min="0" placeholder="8" />
          </label>
        </div>
        <div className="studio-form-grid">
          <label className="studio-check">
            <input name="has_photos" type="checkbox" />
            Ja possui fotos
          </label>
          <label className="studio-check">
            <input name="has_domain" type="checkbox" />
            Ja possui dominio
          </label>
        </div>
        <label>
          Plano de interesse
          <select name="interested_plan" defaultValue={defaultPlan}>
            {studioPlans.map((plan) => (
              <option key={plan.slug} value={plan.slug}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mensagem
          <textarea name="message" rows={5} placeholder="Conte como voce quer posicionar sua marca e o que deseja vender mais." />
        </label>
        <button className="studio-button primary" type="submit">
          Quero minha vitrine premium
        </button>
      </form>
    </div>
  );
}

function StatusMessage({ status }: { status: string }) {
  const messages: Record<string, string> = {
    recebido:
      "Recebemos sua solicitacao. Vamos chamar voce para desenhar uma presenca mais luxuosa para sua casa.",
    pendente:
      "Recebemos sua solicitacao. Se nossa equipe ainda nao responder, chame tambem pelo WhatsApp comercial.",
    incompleto: "Preencha nome da casa, responsavel e WhatsApp.",
  };

  return <div className="studio-form-status">{messages[status] || messages.recebido}</div>;
}
