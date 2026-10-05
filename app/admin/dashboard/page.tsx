import { redirect } from "next/navigation";

// Tela antiga: gravava direto do navegador com a chave publica, a RLS barrava
// e mesmo assim mostrava sucesso. O admin do Lounge vive em /admin/lounge.
export default function LegacyDashboardPage() {
  redirect("/admin/lounge");
}
