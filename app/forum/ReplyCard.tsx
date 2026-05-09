import type { ForumReply } from "./forum-types";
import { formatForumDate } from "./forum-utils";

export default function ReplyCard({ reply }: { reply: ForumReply }) {
  return (
    <article className="forum-reply-card p-5">
      <p className="whitespace-pre-line leading-7 text-[#f8f8f2]">
        {reply.conteudo}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#85859a]">
        <span>por {reply.author_nickname || "Anônimo"}</span>
        <span>{formatForumDate(reply.created_at)}</span>
      </div>
    </article>
  );
}
