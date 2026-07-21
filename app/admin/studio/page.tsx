import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStudioPage() {
  const supabase = await createClient();
  const [clinics, professionals, leads] = await Promise.all([
    supabase.from("studio_clinics").select("id", { count: "exact", head: true }),
    supabase.from("studio_professionals").select("id", { count: "exact", head: true }),
    supabase.from("studio_leads").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main className="premium-shell p-8">
      <section className="site-container">
        <p className="premium-kicker">Admin Studio</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Gestao do PrivacyLog Studio
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric title="Clinicas" value={clinics.count || 0} />
          <Metric title="Profissionais" value={professionals.count || 0} />
          <Metric title="Leads" value={leads.count || 0} />
          <Metric title="Templates" value="5" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            ["Clínicas", "/admin/studio/clinicas"],
            ["Massagistas", "/admin/studio/massagistas"],
            ["Planos", "/admin/studio/planos"],
            ["Leads", "/admin/studio/leads"],
            ["Templates", "/admin/studio/templates"],
            ["Banners", "/admin/studio/banners"],
            ["Relatorios", "/admin/studio/relatorios"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="secondary-button">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return (
    <article className="privacy-card p-6">
      <p className="text-sm font-bold text-[#a1a1aa]">{title}</p>
      <strong className="mt-3 block text-3xl font-black text-[#f6c453]">
        {value}
      </strong>
    </article>
  );
}
