import Link from "next/link";
import PartnerClinicCard from "@/components/studio/PartnerClinicCard";
import { pageMetadata } from "@/lib/seo";
import { getApprovedStudioClinics } from "@/lib/studio/db";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Clinicas Parceiras PrivacyLog Studio",
  description:
    "Conheca casas parceiras PrivacyLog Studio com paginas premium, atmosfera reservada e contato direto para reserva.",
  product: "studio",
  path: "/clinicas",
});

export default async function StudioClinicsPage() {
  const clinics = await getApprovedStudioClinics();

  return (
    <main className="studio-shell">
      <section className="studio-directory-head">
        <div className="studio-container studio-directory-bar">
          <div className="studio-directory-title">
            <h1>Casas parceiras PrivacyLog</h1>
            <span>Vitrines anunciadas para conhecer e reservar</span>
          </div>

          <Link className="studio-directory-link" href="/studio/solicitar-site">
            Quero divulgar minha casa
          </Link>
        </div>
      </section>

      <section className="studio-directory-results">
        <div className="studio-container">
          <div className="studio-clinic-grid">
            {clinics.map((clinic) => (
              <PartnerClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
