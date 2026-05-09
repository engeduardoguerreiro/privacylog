import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Lock, MessageCircle, Pin, Reply } from "lucide-react";
import ForumTopbar from "../../ForumTopbar";
import RatingBadge from "../../RatingBadge";
import ReplyCard from "../../ReplyCard";
import { getRepliesByTopic, getTopicById } from "../../forum-data";
import { formatForumDate } from "../../forum-utils";
import ResponderTopico from "./ResponderTopico";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TopicoPage({ params }: PageProps) {
  const { id } = await params;
  const topicId = Number(id);

  if (!Number.isInteger(topicId) || topicId <= 0) {
    notFound();
  }

  const topic = await getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const replies = await getRepliesByTopic(topic.id);
  const categoryId = topic.forum_categories?.id || topic.category_id;

  return (
    <main className="forum-shell">
      <ForumTopbar />

      <div className="site-container max-w-5xl py-10">
        <Link
          href={categoryId ? `/forum/categoria/${categoryId}` : "/forum"}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#38bdf8] hover:text-white"
        >
          <ArrowLeft size={16} />
          {categoryId ? "Voltar à categoria" : "Voltar ao fórum"}
        </Link>

        <article className="forum-form-card p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#38bdf8]">
            {categoryId ? (
              <Link
                href={`/forum/categoria/${categoryId}`}
                className="hover:text-white"
              >
                {topic.forum_categories?.nome || "Categoria"}
              </Link>
            ) : (
              <span>Sem categoria</span>
            )}

            <RatingBadge nota={topic.nota} />

            {topic.fixado ? (
              <span className="privacy-badge badge-premium">
                <Pin size={12} />
                Fixado
              </span>
            ) : null}
            {topic.trancado ? (
              <span className="privacy-badge badge-alert">
                <Lock size={12} />
                Trancado
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 text-3xl font-black text-white md:text-5xl">
            {topic.titulo}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[#85859a]">
            <span>por {topic.author_nickname || "Anônimo"}</span>
            <span>{formatForumDate(topic.created_at)}</span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={15} />
              {replies.length} respostas
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={15} />
              {topic.views || 0} views
            </span>
          </div>

          <div className="mt-8 whitespace-pre-line text-base leading-8 text-[#f8f8f2]">
            {topic.conteudo}
          </div>
        </article>

        <section className="forum-form-card mt-6 p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="inline-flex items-center gap-2 text-2xl font-black text-white">
              <Reply size={22} />
              Respostas
            </h2>
            <span className="text-sm text-[#85859a]">{replies.length}</span>
          </div>

          {replies.length === 0 ? (
            <p className="text-[#b8b8c8]">
              Ainda não há respostas neste tópico.
            </p>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>
          )}
        </section>

        <ResponderTopico topicId={topic.id} locked={Boolean(topic.trancado)} />
      </div>
    </main>
  );
}
