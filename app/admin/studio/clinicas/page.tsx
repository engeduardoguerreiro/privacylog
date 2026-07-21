import Link from "next/link";
import { getStudioClinicPrimaryUrl, studioClinics } from "@/lib/studio/data";

export default function AdminStudioClinicsPage() {
  return (
    <AdminStudioList
      title="Clinicas Studio"
      description="Aprovar, associar usuário, alterar plano, destacar e suspender clínicas."
      rows={studioClinics.map((clinic) => [
        clinic.name,
        clinic.plan,
        getStudioClinicPrimaryUrl(clinic).replace("https://", ""),
        clinic.status,
      ])}
      action="Criar clinica manualmente"
    />
  );
}

function AdminStudioList({
  title,
  description,
  rows,
  action,
}: {
  title: string;
  description: string;
  rows: string[][];
  action: string;
}) {
  return (
    <main className="premium-shell p-8">
      <section className="site-container">
        <p className="premium-kicker">Admin Studio</p>
        <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
        <p className="mt-3 max-w-3xl text-[#a1a1aa]">{description}</p>
        <div className="mt-6 flex gap-3">
          <Link href="/admin/studio" className="secondary-button">
            Voltar
          </Link>
          <button type="button" className="primary-button">
            {action}
          </button>
        </div>
        <div className="privacy-card mt-8 overflow-hidden">
          {rows.map((row) => (
            <div key={row.join("-")} className="grid gap-3 border-b border-[#2a2a35] p-4 text-sm text-white md:grid-cols-4">
              {row.map((cell) => (
                <span key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
