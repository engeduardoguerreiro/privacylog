import type { Metadata } from "next";
import ClinicaPage from "@/app/clinica/[id]/page";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("clinicas")
    .select("nome,descricao,cidade,bairro,estado,imagens")
    .eq("id", Number(id))
    .maybeSingle();

  if (!data) {
    return {
      title: "Local | PrivacyLog Lounge",
      description: "Página individual do local no PrivacyLog Lounge.",
    };
  }

  return {
    title: `${data.nome} | PrivacyLog Lounge`,
    description:
      data.descricao ||
      `${data.nome} em ${data.bairro || data.cidade || "Brasil"} no PrivacyLog Lounge.`,
  };
}

export default function LoungeClinicaPage() {
  return <ClinicaPage />;
}
