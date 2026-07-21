import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoungePage() {
  const supabase = await createClient();
  const [locations, premium] = await Promise.all([
    supabase.from("clinicas").select("id", { count: "exact", head: true }),
    supabase
      .from("clinicas")
      .select("id", { count: "exact", head: true })
      .eq("plano", "premium"),
  ]);

  return (
    <main className="premium-shell p-8">
      <section className="site-container">
        <p className="premium-kicker">Admin Lounge</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Gestão do PrivacyLog Lounge
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Metric title="Total de clínicas" value={locations.count || 0} />
          <Metric title="Premium" value={premium.count || 0} />
          <Metric title="Denúncias abertas" value="Preparado" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin/lounge/cadastrar" className="primary-button">
            Cadastrar local
          </Link>
          <Link href="/admin/dashboard" className="secondary-button">
            Gerenciar clínicas
          </Link>
          <Link href="/lounge/planos" className="secondary-button">
            Ver planos
          </Link>
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
