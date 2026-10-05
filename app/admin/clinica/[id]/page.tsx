import { redirect } from "next/navigation";

// Tela antiga: gravava direto do navegador com a chave publica, a RLS barrava
// e mesmo assim mostrava "Atualizado com sucesso!". A edicao com server
// action e checagem de admin fica em /admin/lounge/[id]/editar.
export default async function LegacyClinicEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/lounge/${encodeURIComponent(id)}/editar`);
}
