import { getLoungeCities } from "@/lib/lounge/cities";
import { pageMetadata } from "@/lib/seo";
import Directory from "./Directory";
import { getDirectoryLocals, getPartnerClinics } from "./data";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Casas de massagem sensual, clínicas e privês | PrivacyLog",
  description:
    "Todas as casas de massagem sensual, tântrica e relaxante, clínicas e privês do PrivacyLog, com endereço, fotos e contato direto no WhatsApp.",
  path: "/clinicas",
});

export default async function ClinicasPage() {
  const [cities, partners, locals] = await Promise.all([
    getLoungeCities(),
    getPartnerClinics(),
    getDirectoryLocals(),
  ]);

  return (
    <Directory
      kicker="Todas as casas"
      title="Casas de massagem sensual, clínicas e privês"
      lead="Todas as casas do PrivacyLog em um só lugar. Escolha a cidade, veja fotos e endereço e chame direto no WhatsApp, com discrição."
      cities={cities}
      partners={partners}
      locals={locals}
    />
  );
}
