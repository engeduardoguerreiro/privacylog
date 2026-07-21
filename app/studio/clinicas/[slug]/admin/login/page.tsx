import AuthForm from "@/app/login/AuthForm";
import { getApprovedStudioClinicBySlug } from "@/lib/studio/db";

export default async function ClinicAdminLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clinic = await getApprovedStudioClinicBySlug(slug);
  const title = clinic?.name || "Clínica Studio";

  return (
    <main className="clinic-admin-auth">
      <section>
        <p className="clinic-kicker">Acesso administrativo</p>
        <h1>{title}</h1>
        <p>Entre com o e-mail vinculado à landing page para atualizar modelos e disponibilidade.</p>
        <AuthForm
          allowSignup={false}
          nextPath={`/studio/clinicas/${slug}/admin`}
          product="studio"
        />
      </section>
    </main>
  );
}
