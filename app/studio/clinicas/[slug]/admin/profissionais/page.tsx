import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Check, Plus, Trash2 } from "lucide-react";
import { isAdminUser } from "@/lib/auth/admin";
import ClinicAdminFrame from "@/components/studio/ClinicAdminFrame";
import ClinicProfessionalFormEnhancer from "@/components/studio/ClinicProfessionalFormEnhancer";
import { getApprovedStudioClinicBySlug } from "@/lib/studio/db";
import { createClient } from "@/lib/supabase/server";
import { removeProfessional, saveProfessional, toggleProfessional } from "./actions";

export default async function ClinicProfessionalsAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  await connection();
  const { slug } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/studio/clinicas/${slug}/admin/login`);
  }

  const clinic = await getApprovedStudioClinicBySlug(slug);

  if (!clinic || (clinic.ownerId !== user.id && !isAdminUser(user))) {
    redirect(`/studio/clinicas/${slug}/admin/login?access=denied`);
  }

  return (
    <ClinicAdminFrame clinic={clinic} active="professionals">
      <ClinicProfessionalFormEnhancer />
      <div className="clinic-admin-professionals-grid">
      <section className="clinic-admin-management-card">
        <Link href={`/studio/clinicas/${slug}/admin`} className="clinic-admin-back">
          Voltar ao dashboard
        </Link>
        {query.status === "salvo" ? (
          <p className="clinic-admin-success">Alteração salva com sucesso.</p>
        ) : null}
        {query.status === "excluido" ? (
          <p className="clinic-admin-success">Profissional excluida com sucesso.</p>
        ) : null}
        {query.error ? (
          <p className="clinic-admin-error">
            Não foi possível salvar. Detalhe: {decodeURIComponent(query.error)}
          </p>
        ) : null}
        <p className="clinic-kicker">Profissionais</p>
        <h1>{clinic.name}</h1>
        <details className="clinic-admin-create">
          <summary>
            <Plus size={18} />
            Cadastrar profissional
          </summary>
          <form action={saveProfessional.bind(null, slug)} className="clinic-admin-form">
          <input name="name" placeholder="Nome profissional" required />
          <input name="shortDescription" placeholder="Descrição curta" />
          <input name="specialties" placeholder="Especialidades separadas por vírgula" />
          <div className="clinic-photo-inputs">
            {[1, 2, 3, 4].map((item) => (
              <label key={item}>
                Foto {item}
                <input name={`photo${item}`} type="file" accept="image/*" />
              </label>
            ))}
          </div>
          <label>
            <input type="checkbox" name="active" defaultChecked />
            Ativa na vitrine
          </label>
          <label>
            <input type="checkbox" name="availableToday" defaultChecked />
            Disponível hoje
          </label>
          <button type="submit" className="clinic-whatsapp-main">
            Salvar profissional
          </button>
          </form>
        </details>
      </section>

      <section className="clinic-admin-management-card">
        <h2>Lista do dia</h2>
        <div className="clinic-admin-list">
          {clinic.professionals.map((professional) => (
            <article key={professional.id}>
              <div className="clinic-admin-professional-info">
                <strong>{professional.stageName}</strong>
                <span>{professional.shortDescription || "Sem descrição"}</span>
              </div>
              <div className="clinic-admin-row-actions">
              <form action={toggleProfessional.bind(null, slug, professional.id, !professional.isAvailableToday)}>
                <button type="submit">
                  <Check size={16} />
                  {professional.isAvailableToday ? "Marcar indisponível" : "Disponível hoje"}
                </button>
              </form>
              <form action={removeProfessional.bind(null, slug, professional.id)}>
                <button type="submit" className="danger">
                  <Trash2 size={16} />
                  Excluir
                </button>
              </form>
              </div>
              <details>
                <summary>Editar</summary>
                <form action={saveProfessional.bind(null, slug)} className="clinic-admin-form">
                  <input type="hidden" name="id" value={professional.id} />
                  <input name="name" defaultValue={professional.stageName} placeholder="Nome profissional" />
                  <input
                    name="shortDescription"
                    defaultValue={professional.shortDescription}
                    placeholder="Descrição curta"
                  />
                  <input
                    name="specialties"
                    defaultValue={professional.services.join(", ")}
                    placeholder="Especialidades"
                  />
                  <input
                    type="hidden"
                    name="currentMainPhotoUrl"
                    value={professional.mainPhotoUrl}
                  />
                  {Array.from({ length: 4 }).map((_, index) => (
                    <input
                      key={index}
                      type="hidden"
                      name={`currentPhoto${index + 1}`}
                      value={professional.photos[index] || ""}
                    />
                  ))}
                  <div className="clinic-photo-inputs">
                    {[1, 2, 3, 4].map((item) => (
                      <label key={item}>
                        Nova foto {item}
                        <input name={`photo${item}`} type="file" accept="image/*" />
                      </label>
                    ))}
                  </div>
                  <label>
                    <input type="checkbox" name="active" defaultChecked={professional.isActive} />
                    Ativa
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="availableToday"
                      defaultChecked={professional.isAvailableToday}
                    />
                    Disponível hoje
                  </label>
                  <button type="submit">Salvar edição</button>
                </form>
              </details>
            </article>
          ))}
        </div>
      </section>
      </div>
    </ClinicAdminFrame>
  );
}
