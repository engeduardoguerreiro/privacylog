import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import ForumTopbar from "../ForumTopbar";
import { forumStates, getCategoriesWithStats } from "../forum-data";

export default async function NovoTopicoCategoriaPage() {
  const categories = await getCategoriesWithStats();
  const stateCategories = forumStates
    .map((state) =>
      categories.find(
        (category) => !category.parent_id && category.estado === state.estado
      )
    )
    .filter(Boolean);

  return (
    <main className="forum-shell">
      <ForumTopbar />

      <div className="site-container max-w-5xl py-10">
        <Link
          href="/forum"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#38bdf8] hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar ao fórum
        </Link>

        <section className="mb-8">
          <p className="premium-kicker">Publicação</p>
          <h1 className="mt-3 text-4xl font-black text-white">
            Escolha a categoria
          </h1>
          <p className="mt-4 max-w-2xl text-[#b8b8c8]">
            O tópico será criado dentro da categoria selecionada. Para um local
            específico, entre no estado e depois na subcategoria do local.
          </p>
        </section>

        <div className="space-y-8">
          {stateCategories.map((stateCategory) => {
            if (!stateCategory) {
              return null;
            }

            const childCategories = categories.filter(
              (category) =>
                category.parent_id === stateCategory.id && !category.clinic_id
            );

            return (
              <section key={stateCategory.id}>
                <h2 className="mb-4 text-2xl font-black text-white">
                  {stateCategory.nome}
                </h2>
                <div className="grid gap-3 md:grid-cols-4">
                  {childCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/forum/novo-topico/${category.id}`}
                      className="forum-card group flex min-h-28 flex-col justify-between p-5"
                    >
                      <div>
                        <span className="privacy-badge badge-purple">
                          Categoria
                        </span>
                        <h3 className="mt-4 font-black text-white">
                          {category.nome}
                        </h3>
                        <p className="mt-2 text-xs text-[#85859a]">
                          {category.topic_count || 0} tópicos
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#f6c453] group-hover:text-white">
                        <Plus size={15} />
                        Criar aqui
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
