import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ForumTopbar from "../../ForumTopbar";
import { getNewTopicCategory } from "../../forum-data";
import NovoTopicoForm from "./NovoTopicoForm";

interface PageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function NovoTopicoPage({ params }: PageProps) {
  const { categoryId } = await params;
  const parsedCategoryId = Number(categoryId);

  if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
    notFound();
  }

  const result = await getNewTopicCategory(parsedCategoryId);

  if (!result) {
    notFound();
  }

  const { category, path } = result;

  return (
    <main className="forum-shell">
      <ForumTopbar />

      <div className="site-container max-w-3xl py-10">
        <Link
          href={`/forum/categoria/${category.id}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#38bdf8] hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar à categoria
        </Link>

        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#85859a]">
          <Link href="/forum" className="hover:text-white">
            Fórum
          </Link>
          {path.map((item) => (
            <span key={item.id} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={`/forum/categoria/${item.id}`}
                className={item.id === category.id ? "text-white" : "hover:text-white"}
              >
                {item.nome}
              </Link>
            </span>
          ))}
        </nav>

        <section className="mb-8">
          <p className="premium-kicker">
            Publicação
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            Criar novo tópico
          </h1>
          <p className="mt-4 text-[#b8b8c8]">
            Abra uma conversa dentro da categoria certa para manter o fórum
            organizado por estado e local.
          </p>
        </section>

        <NovoTopicoForm category={category} />
      </div>
    </main>
  );
}
