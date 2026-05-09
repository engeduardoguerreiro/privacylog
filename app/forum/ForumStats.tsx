import { MessageCircle, MessagesSquare, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { formatForumDate } from "./forum-utils";

export default function ForumStats({
  lastActivityAt,
  replies,
  topics,
}: {
  lastActivityAt?: string | null;
  replies: number;
  topics: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard icon={<MessagesSquare size={18} />} label="Tópicos" value={topics} />
      <StatCard icon={<MessageCircle size={18} />} label="Respostas" value={replies} />
      <StatCard
        icon={<Timer size={18} />}
        label="Última atividade"
        value={lastActivityAt ? formatForumDate(lastActivityAt) : "Sem posts"}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="forum-stat-card p-4">
      <div className="flex items-center gap-2 text-sm text-[#85859a]">
        <span className="text-[#f6c453]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
