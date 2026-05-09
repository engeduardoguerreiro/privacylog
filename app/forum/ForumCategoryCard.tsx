import Link from "next/link";
import {
  ChevronRight,
  FolderTree,
  MessageCircle,
  MessagesSquare,
  Timer,
} from "lucide-react";
import type { ForumCategory } from "./forum-types";
import { formatForumDate } from "./forum-utils";

export default function ForumCategoryCard({
  category,
  variant = "card",
}: {
  category: ForumCategory;
  variant?: "card" | "row";
}) {
  const badge = getCategoryBadge(category);

  if (variant === "row") {
    return (
      <Link
        href={`/forum/categoria/${category.id}`}
        className={`forum-category-row group ${badge.rowClass}`}
      >
        <div className="forum-category-row-main">
          <div className="min-w-0">
            <h3>{category.nome}</h3>
            <p>
              {category.descricao ||
                "Discussões e avaliações da comunidade."}
            </p>
          </div>
        </div>

        <div className="forum-category-row-stats">
          <span>
            <MessagesSquare size={14} />
            {category.topic_count || 0} tópicos
          </span>
          <span>
            <MessageCircle size={14} />
            {category.reply_count || 0} respostas
          </span>
          <span>
            <Timer size={14} />
            {category.last_activity_at
              ? formatForumDate(category.last_activity_at)
              : "Sem posts"}
          </span>
        </div>

        <ChevronRight
          size={18}
          className="forum-category-row-arrow"
        />
      </Link>
    );
  }

  return (
    <Link
      href={`/forum/categoria/${category.id}`}
      className={`forum-card group block p-5 ${badge.borderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`privacy-badge ${badge.className}`}>
            {badge.label}
          </span>
          <h3 className="mt-4 text-lg font-black text-white">
            {category.nome}
          </h3>
          <p className="mt-2 min-h-10 text-sm leading-6 text-[#b8b8c8]">
            {category.descricao || "Discussões e avaliações da comunidade."}
          </p>
        </div>
        <ChevronRight
          size={18}
          className="mt-1 shrink-0 text-[#85859a] transition group-hover:text-[#f6c453]"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-[#85859a]">
        <span className="inline-flex items-center gap-1">
          <MessagesSquare size={14} />
          {category.topic_count || 0} tópicos
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={14} />
          {category.reply_count || 0} respostas
        </span>
        {category.child_count ? (
          <span className="inline-flex items-center gap-1">
            <FolderTree size={14} />
            {category.child_count} subcategorias
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Timer size={14} />
          {category.last_activity_at
            ? formatForumDate(category.last_activity_at)
            : "Sem posts"}
        </span>
      </div>
    </Link>
  );
}

function getCategoryBadge(category: ForumCategory) {
  if (category.nome.toLowerCase().includes("alerta")) {
    return {
      className: "badge-alert",
      borderClass: "border-[#dc2626]/35",
      rowClass: "forum-category-row-alert",
      label: "Alerta",
    };
  }

  if (category.clinic_id) {
    return {
      className: "badge-premium",
      borderClass: "border-[#f6c453]/30",
      rowClass: "forum-category-row-gold",
      label: "Avaliações reais",
    };
  }

  if (category.tipo === "clinica") {
    return {
      className: "badge-blue",
      borderClass: "border-[#38bdf8]/30",
      rowClass: "forum-category-row-blue",
      label: "Clínicas",
    };
  }

  if (category.tipo === "freelancer") {
    return {
      className: "badge-private",
      borderClass: "border-[#ec4899]/30",
      rowClass: "forum-category-row-pink",
      label: "Freelancers",
    };
  }

  if (category.tipo === "swing") {
    return {
      className: "badge-purple",
      borderClass: "border-[#8b5cf6]/30",
      rowClass: "forum-category-row-purple",
      label: "Swing",
    };
  }

  if (category.tipo === "boate" || category.tipo === "prive") {
    return {
      className: "badge-pink",
      borderClass: "border-[#ec4899]/30",
      rowClass: "forum-category-row-pink",
      label: "Privês e boates",
    };
  }

  return {
    className: "badge-purple",
    borderClass: "border-[#8b5cf6]/30",
    rowClass: "forum-category-row-purple",
    label: category.parent_id ? "Dúvidas e relatos" : "Região",
  };
}
