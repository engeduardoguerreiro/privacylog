import { createClient } from "@/lib/supabase/server";

export default async function AdminStudioLeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_leads")
    .select("id, clinic_name, responsible_name, whatsapp, city, interested_plan, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="premium-shell p-8">
      <section className="site-container">
        <p className="premium-kicker">Admin Studio</p>
        <h1 className="mt-3 text-4xl font-black text-white">Leads Studio</h1>
        <div className="privacy-card mt-8 overflow-hidden">
          {(data || []).map((lead) => (
            <div key={lead.id} className="grid gap-3 border-b border-[#2a2a35] p-4 text-sm text-white md:grid-cols-6">
              <span>{lead.clinic_name}</span>
              <span>{lead.responsible_name}</span>
              <span>{lead.whatsapp}</span>
              <span>{lead.city}</span>
              <span>{lead.interested_plan}</span>
              <span>{lead.status}</span>
            </div>
          ))}
          {!data?.length ? (
            <p className="p-4 text-sm text-[#a1a1aa]">
              Nenhum lead encontrado ou tabela ainda nao publicada.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
