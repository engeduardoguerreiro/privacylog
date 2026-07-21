import ProfessionalForm from "@/components/studio/ProfessionalForm";
import ProfessionalCard from "@/components/studio/ProfessionalCard";
import { studioClinics } from "@/lib/studio/data";

export default function StudioPanelProfessionalsPage() {
  const clinic = studioClinics[0];

  return (
    <>
      <p className="studio-kicker">Massagistas e profissionais</p>
      <h1>Equipe da {clinic.name}</h1>
      <ProfessionalForm />
      <div className="studio-professional-grid">
        {clinic.professionals.map((professional) => (
          <ProfessionalCard key={professional.id} clinic={clinic} professional={professional} />
        ))}
      </div>
    </>
  );
}
