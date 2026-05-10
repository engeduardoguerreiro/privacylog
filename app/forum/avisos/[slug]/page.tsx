import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import ForumTopbar from "../../ForumTopbar";
import { getRulesPage, rulesPages } from "../rules-content";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return rulesPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getRulesPage(slug);

  if (!page) {
    return {
      title: "Avisos e Regras Gerais",
    };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function ForumRulesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getRulesPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="forum-shell">
      <ForumTopbar />

      <div className="site-container py-10">
        <Link
          href="/forum/avisos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#38bdf8] hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar aos avisos
        </Link>

        <article className="forum-form-card p-7 md:p-9">
          <span className="privacy-badge badge-alert">
            <ShieldAlert size={14} />
            {page.eyebrow}
          </span>

          <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[#b8b8c8]">
            {page.description}
          </p>

          <div className="mt-8 grid gap-4">
            {page.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border border-[#2d2d44] bg-[#10101c] p-5"
              >
                <h2 className="text-xl font-black text-white">
                  {section.title}
                </h2>
                <p className="mt-3 leading-7 text-[#b8b8c8]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-[#f6c453]/25 bg-[#f6c453]/10 p-5 text-sm leading-6 text-[#f1d9d9]">
            Estas orientações não substituem aconselhamento jurídico. Elas
            definem a conduta mínima esperada para participação segura no
            PrivacyLog.
          </div>
        </article>
      </div>
    </main>
  );
}
