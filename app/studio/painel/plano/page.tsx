import { permanentRedirect } from "next/navigation";

/** A gestao de plano virou a pagina de assinatura, com cobranca de verdade. */
export default function StudioPanelPlanPage() {
  permanentRedirect("/studio/painel/assinatura");
}
