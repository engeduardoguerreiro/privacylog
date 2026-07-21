import { studioClinics } from "@/lib/studio/data";

export default function AdminStudioProfessionalsPage() {
  const professionals = studioClinics.flatMap((clinic) =>
    clinic.professionals.map((professional) => ({
      ...professional,
      clinicName: clinic.name,
    }))
  );

  return (
    <main className="premium-shell p-8">
      <section className="site-container">
        <p className="premium-kicker">Admin Studio</p>
        <h1 className="mt-3 text-4xl font-black text-white">Massagistas</h1>
        <div className="privacy-card mt-8 overflow-hidden">
          {professionals.map((professional) => (
            <div key={professional.id} className="grid gap-3 border-b border-[#2a2a35] p-4 text-sm text-white md:grid-cols-4">
              <span>{professional.stageName}</span>
              <span>{professional.clinicName}</span>
              <span>{professional.status}</span>
              <span>{professional.isFeatured ? "Destaque" : "Normal"}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
