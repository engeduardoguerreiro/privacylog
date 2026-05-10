import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import ForumTopbar from "../ForumTopbar";
import { generalRulesCategorySlug, getCategoryBySlug } from "../forum-data";

export const metadata: Metadata = {
  title: "Avisos e Regras Gerais",
  description:
    "Regras de conduta, avisos oficiais e orientações de segurança do fórum PrivacyLog.",
};

export default async function ForumRulesPage() {
  let categoryId: number | null = null;

  try {
    const category = await getCategoryBySlug(generalRulesCategorySlug);
    categoryId = category?.id || null;
  } catch {
    categoryId = null;
  }

  if (categoryId) {
    redirect(`/forum/categoria/${categoryId}`);
  }

  return (
    <main className="forum-shell">
      <ForumTopbar />

      <div className="site-container py-10">
        <Link
          href="/forum"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#38bdf8] hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar ao fórum
        </Link>

        <section className="forum-form-card p-7 md:p-9">
          <span className="privacy-badge badge-alert">
            <ShieldAlert size={14} />
            Importante
          </span>

          <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
            Avisos e Regras Gerais
          </h1>
          <p className="mt-4 max-w-3xl text-[#b8b8c8]">
            Esta área reúne comunicados oficiais, regras de conduta e
            orientações para manter o PrivacyLog organizado, discreto e seguro
            para a comunidade adulta.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <article
                key={rule.title}
                className="rounded-lg border border-[#2d2d44] bg-[#10101c] p-5"
              >
                <h2 className="text-lg font-black text-white">{rule.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#b8b8c8]">
                  {rule.description}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-7 text-sm leading-6 text-[#85859a]">
            A categoria oficial será aberta automaticamente quando o registro
            estiver sincronizado no Supabase. Até lá, esta página mantém os
            avisos principais visíveis para todos.
          </p>
        </section>
      </div>
    </main>
  );
}

const rules = [
  {
    title: "Acesso somente para maiores de 18 anos",
    description:
      "O site e o fórum são destinados exclusivamente a adultos. Conteúdo envolvendo menores de idade é proibido e deve ser denunciado imediatamente.",
  },
  {
    title: "Privacidade e discrição",
    description:
      "Não publique dados pessoais, documentos, endereços residenciais, fotos privadas, conversas privadas ou qualquer informação que exponha terceiros.",
  },
  {
    title: "Relatos responsáveis",
    description:
      "Relatos devem ser objetivos, respeitosos e baseados em experiência própria. Evite acusações sem contexto, ameaças ou linguagem de perseguição.",
  },
  {
    title: "Segurança da comunidade",
    description:
      "Golpes, extorsão, spam, links maliciosos, divulgação indevida e tentativa de manipular avaliações podem resultar em remoção e bloqueio.",
  },
];
