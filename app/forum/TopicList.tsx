import Link from "next/link";
import { Eye, Lock, MessageCircle, Pin, Timer } from "lucide-react";
import type { ForumTopic } from "./forum-types";
import { excerpt, formatForumDate } from "./forum-utils";
import RatingBadge from "./RatingBadge";

export default function TopicList({
  emptyMessage,
  showCategory = true,
  topics,
}: {
  emptyMessage: string;
  showCategory?: boolean;
  topics: ForumTopic[];
}) {
  if (topics.length === 0) {
    return <div className="forum-card p-6 text-[#b8b8c8]">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <Link
          key={topic.id}
          href={`/forum/topico/${topic.id}`}
          className="forum-topic-card block p-5"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#38bdf8]">
                {showCategory ? (
                  <span>{topic.forum_categories?.nome || "Sem categoria"}</span>
                ) : null}
                <span className="text-[#85859a]">
                  por {topic.author_nickname || "Anônimo"}
                </span>
                <RatingBadge nota={topic.nota} />
                {isNew(topic.created_at) ? (
                  <span className="privacy-badge badge-blue">Novo</span>
                ) : null}
                {(topic.reply_count || 0) >= 5 ? (
                  <span className="privacy-badge badge-purple">Popular</span>
                ) : null}
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

              <h3 className="mt-3 text-xl font-black text-white">
                {topic.titulo}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#b8b8c8]">
                {excerpt(topic.conteudo)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 text-sm text-[#85859a] md:justify-end">
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={15} />
                {topic.reply_count || 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={15} />
                {topic.views || 0}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#85859a]">
            <span>Criado em {formatForumDate(topic.created_at)}</span>
            {topic.last_reply_at ? (
              <span className="inline-flex items-center gap-1">
                <Timer size={14} />
                Última resposta {formatForumDate(topic.last_reply_at)}
              </span>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function isNew(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const age = Date.now() - new Date(value).getTime();

  return age < 1000 * 60 * 60 * 24 * 3;
}
