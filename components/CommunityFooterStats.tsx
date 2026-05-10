"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Radio, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CommunityStats = {
  totalMessages: number;
  totalTopics: number;
  totalMembers: number;
};

type OnlineStats = {
  total: number;
  registered: number;
  invisible: number;
  visitors: number;
};

const emptyStats: CommunityStats = {
  totalMessages: 0,
  totalTopics: 0,
  totalMembers: 0,
};

const initialOnline: OnlineStats = {
  total: 1,
  registered: 0,
  invisible: 0,
  visitors: 1,
};

const presenceChannelName = "privacylog-site-online";
const visitorStorageKey = "privacylog-visitor-presence-id";

export default function CommunityFooterStats({
  initialStats,
}: {
  initialStats?: CommunityStats;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState<CommunityStats>(
    initialStats || emptyStats
  );
  const [online, setOnline] = useState<OnlineStats>(initialOnline);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      const [topicsResult, repliesResult, membersResult] = await Promise.all([
        supabase
          .from("forum_topics")
          .select("id", { count: "exact", head: true })
          .or("oculto.is.null,oculto.eq.false"),
        supabase
          .from("forum_replies")
          .select("id", { count: "exact", head: true })
          .or("oculto.is.null,oculto.eq.false"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      if (!active) {
        return;
      }

      const totalTopics = topicsResult.count ?? initialStats?.totalTopics ?? 0;
      const totalReplies =
        repliesResult.count ??
        Math.max((initialStats?.totalMessages ?? 0) - totalTopics, 0);
      const totalMembers =
        membersResult.count ?? initialStats?.totalMembers ?? 0;

      setStats({
        totalMessages: totalTopics + totalReplies,
        totalTopics,
        totalMembers,
      });
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [
    initialStats?.totalMembers,
    initialStats?.totalMessages,
    initialStats?.totalTopics,
    supabase,
  ]);

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function connectPresence() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      const presenceKey = user?.id
        ? `user:${user.id}`
        : `visitor:${getVisitorPresenceId()}`;

      channel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: presenceKey,
          },
        },
      });

      channel.on("presence", { event: "sync" }, () => {
        if (!channel) {
          return;
        }

        setOnline(countPresence(channel.presenceState()));
      });

      channel.subscribe((status) => {
        if (status !== "SUBSCRIBED" || !channel) {
          return;
        }

        channel.track({
          kind: user ? "registered" : "visitor",
          invisible: false,
          onlineAt: new Date().toISOString(),
        });
      });
    }

    connectPresence();

    return () => {
      isMounted = false;

      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  return (
    <section className="community-footer-stats" aria-label="Resumo da comunidade">
      <div className="community-stat-panel">
        <div className="community-stat-heading">
          <span>
            <Radio size={17} />
          </span>
          <h2>Quem está online</h2>
        </div>
        <p>
          No total, há {formatNumber(online.total)} usuários online ::{" "}
          {formatNumber(online.registered)} usuários registrados,{" "}
          {formatNumber(online.invisible)} invisível e{" "}
          {formatNumber(online.visitors)} visitantes
        </p>
      </div>

      <div className="community-stat-panel">
        <div className="community-stat-heading">
          <span>
            <BarChart3 size={17} />
          </span>
          <h2>Estatísticas</h2>
        </div>
        <p>
          Total de mensagens {formatNumber(stats.totalMessages)} • Total de
          tópicos {formatNumber(stats.totalTopics)} • Total de membros{" "}
          {formatNumber(stats.totalMembers)}
        </p>
      </div>

      <div className="community-stat-footnote">
        <Users size={15} />
        <span>Online em tempo real enquanto visitantes navegam pelo site.</span>
      </div>
    </section>
  );
}

function countPresence(state: Record<string, unknown[]>): OnlineStats {
  const presences = Object.values(state)
    .map((group) => group[group.length - 1])
    .filter(Boolean) as Array<{ kind?: string; invisible?: boolean }>;

  const registered = presences.filter(
    (presence) => presence.kind === "registered" && !presence.invisible
  ).length;
  const invisible = presences.filter((presence) => presence.invisible).length;
  const visitors = presences.filter(
    (presence) => presence.kind !== "registered" && !presence.invisible
  ).length;
  const total = registered + invisible + visitors;

  return {
    total: Math.max(total, 1),
    registered,
    invisible,
    visitors: total > 0 ? visitors : 1,
  };
}

function getVisitorPresenceId() {
  const current = window.localStorage.getItem(visitorStorageKey);

  if (current) {
    return current;
  }

  const next =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(visitorStorageKey, next);
  return next;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
