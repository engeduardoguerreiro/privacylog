import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import CategoryGrid from "../../CategoryGrid";
import ForumSearch from "../../ForumSearch";
import ForumStats from "../../ForumStats";
import ForumTopbar from "../../ForumTopbar";
import TopicList from "../../TopicList";
import {
  getCategoriesWithStats,
  getCategoryById,
  getCategoryPath,
  getTopicsByCategory,
  searchTopics,
} from "../../forum-data";
import { normalizeSearchQuery } from "../../forum-utils";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export default async function ForumCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { q } = await searchParams;
  const categoryId = Number(id);
  const searchQuery = normalizeSearchQuery(q);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  const category = await getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  const [allCategories, categoryPath, topics] = await Promise.all([
    getCategoriesWithStats(),
    getCategoryPath(category.id),
    searchQuery
      ? searchTopics({ categoryId: category.id, query: searchQuery })
      : getTopicsByCategory(category.id),
  ]);

  const hydratedCategory =
    allCategories.find((item) => item.id === category.id) || category;
  const childCategories = allCategories.filter(
    (child) => child.parent_id === category.id
  );
  const topicTitle = searchQuery
    ? `Resultados em ${category.nome}`
    : "Tópicos";
  const emptyMessage = searchQuery
    ? "Nenhum tópico encontrado nesta categoria para a busca."
    : "Ainda não há tópicos nesta categoria.";

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

        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#85859a]">
          <Link href="/forum" className="hover:text-white">
            Fórum
          </Link>
          {categoryPath.map((item) => (
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

        <section className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="premium-kicker">Categoria</p>
            <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
              {category.nome}
            </h1>
            <p className="mt-4 max-w-2xl text-[#b8b8c8]">
              {category.descricao || "Tópicos e conversas desta categoria."}
            </p>
          </div>

          <Link
            href={`/forum/novo-topico/${category.id}`}
            className="create-topic-button"
          >
            <Plus size={18} />
            Criar tópico
          </Link>
        </section>

        <section className="mb-8">
          <ForumStats
            topics={hydratedCategory.topic_count || 0}
            replies={hydratedCategory.reply_count || 0}
            lastActivityAt={hydratedCategory.last_activity_at}
          />
        </section>

        <ForumSearch
          action={`/forum/categoria/${category.id}`}
          placeholder={`Buscar em ${category.nome}`}
          query={searchQuery}
        />

        {childCategories.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-black text-white">
              Subcategorias
            </h2>
            <CategoryGrid categories={childCategories} variant="rows" />
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white">{topicTitle}</h2>
            <span className="text-sm text-[#85859a]">
              {topics.length} {searchQuery ? "encontrados" : "publicados"}
            </span>
          </div>

          <TopicList
            topics={topics}
            emptyMessage={emptyMessage}
            showCategory={childCategories.length > 0}
          />
        </section>
      </div>
    </main>
  );
}
