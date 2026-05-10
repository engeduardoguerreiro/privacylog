import Link from "next/link";
import {
  MessageCircle,
  MessagesSquare,
  Plus,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { ensureForumLifestyleCategoriesForAdmin } from "@/lib/forum/seed";
import CategoryGrid from "./CategoryGrid";
import ForumCategoryCard from "./ForumCategoryCard";
import ForumHeroCarousel from "./ForumHeroCarousel";
import ForumSearch from "./ForumSearch";
import ForumStats from "./ForumStats";
import ForumTopbar from "./ForumTopbar";
import TopicList from "./TopicList";
import {
  forumStates,
  generalRulesCategorySlug,
  getCategoriesWithStats,
  searchTopics,
} from "./forum-data";
import { normalizeSearchQuery } from "./forum-utils";

interface PageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export default async function ForumPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const searchQuery = normalizeSearchQuery(q);

  await ensureForumLifestyleCategoriesForAdmin();

  const [categories, topics] = await Promise.all([
    getCategoriesWithStats(),
    searchQuery ? searchTopics({ query: searchQuery }) : Promise.resolve([]),
  ]);

  const stateCategories = forumStates
    .map((state) =>
      categories.find(
        (category) => !category.parent_id && category.estado === state.estado
      )
    )
    .filter(Boolean);
  const generalRulesCategory = categories.find(
    (category) =>
      !category.parent_id && category.slug === generalRulesCategorySlug
  );
  const totals = stateCategories.reduce(
    (acc, category) => ({
      topics: acc.topics + (category?.topic_count || 0),
      replies: acc.replies + (category?.reply_count || 0),
      lastActivityAt:
        dateValue(category?.last_activity_at) > dateValue(acc.lastActivityAt)
          ? category?.last_activity_at || acc.lastActivityAt
          : acc.lastActivityAt,
    }),
    { topics: 0, replies: 0, lastActivityAt: null as string | null }
  );

  return (
    <main className="forum-shell">
      <ForumTopbar />

      <div className="site-container py-10">
        <section className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="premium-kicker">Comunidade privada</p>
            <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
              Fórum <span className="text-[#f6c453]">PrivacyLog</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[#b8b8c8]">
              Discussões por estado, relatos vinculados aos locais do mapa e
              avaliações organizadas por categoria.
            </p>
          </div>

          <Link href="/forum/novo" className="create-topic-button">
            <Plus size={18} />
            Criar tópico
          </Link>
        </section>

        <ForumHeroCarousel />

        <section className="forum-rules-section">
          <div>
            <p className="premium-kicker">Comece por aqui</p>
            <h2>Avisos e Regras Gerais</h2>
          </div>

          {generalRulesCategory ? (
            <ForumCategoryCard category={generalRulesCategory} variant="row" />
          ) : (
            <Link
              href="/forum/avisos"
              className="forum-category-row group forum-category-row-alert"
            >
              <div className="forum-category-row-main">
                <div className="min-w-0">
                  <h3>Avisos e Regras Gerais</h3>
                  <p>
                    Regras de conduta, comunicados oficiais e orientações para
                    participação segura na comunidade.
                  </p>
                </div>
              </div>

              <div className="forum-category-row-stats">
                <span>
                  <MessagesSquare size={14} />0 tópicos
                </span>
                <span>
                  <MessageCircle size={14} />0 respostas
                </span>
                <span>
                  <Timer size={14} />
                  Fixo
                </span>
              </div>

              <ShieldAlert
                size={18}
                className="forum-category-row-arrow"
              />
            </Link>
          )}
        </section>

        <section className="mb-8">
          <ForumStats
            topics={totals.topics}
            replies={totals.replies}
            lastActivityAt={totals.lastActivityAt}
          />
        </section>

        <ForumSearch
          action="/forum"
          placeholder="Buscar tópicos por título ou conteúdo"
          query={searchQuery}
        />

        <section className="mb-10 space-y-8">
          {stateCategories.map((stateCategory) => {
            if (!stateCategory) {
              return null;
            }

            const childCategories = categories.filter(
              (category) =>
                category.parent_id === stateCategory.id && !category.clinic_id
            );

            return (
              <div key={stateCategory.id}>
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {stateCategory.nome}
                    </h2>
                    <p className="mt-1 text-sm text-[#85859a]">
                      {stateCategory.topic_count || 0} tópicos,{" "}
                      {stateCategory.reply_count || 0} respostas
                    </p>
                  </div>
                  <Link
                    href={`/forum/categoria/${stateCategory.id}`}
                    className="secondary-button min-h-10 px-4 text-sm"
                  >
                    Ver estado
                  </Link>
                </div>
                <CategoryGrid categories={childCategories} variant="rows" />
              </div>
            );
          })}
        </section>

        {searchQuery ? (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">
                Resultados para &quot;{searchQuery}&quot;
              </h2>
              <span className="text-sm text-[#85859a]">
                {topics.length} encontrados
              </span>
            </div>

            <TopicList
              topics={topics}
              emptyMessage="Nenhum tópico encontrado para esta busca."
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function dateValue(value: string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}
