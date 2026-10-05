import { permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Conteudo duplicado: a URL canonica e /clinicas/[id] (308)
export default async function ClinicaRedirectPage({ params }: PageProps) {
  const { id } = await params;
  permanentRedirect(`/clinicas/${encodeURIComponent(id)}`);
}
