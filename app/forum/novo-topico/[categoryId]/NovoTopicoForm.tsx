"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ForumCategory } from "../../forum-types";
import { gerarSlug } from "../../forum-utils";

type FormStatus = {
  type: "error" | "success";
  message: string;
} | null;

export default function NovoTopicoForm({
  category,
}: {
  category: ForumCategory;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autor, setAutor] = useState("");
  const [nota, setNota] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNickname() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) {
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      const fallback = `usuario-${user.id.replaceAll("-", "").slice(0, 8)}`;
      setAutor(
        typeof profile?.nickname === "string" && profile.nickname.trim()
          ? profile.nickname
          : fallback
      );
    }

    loadNickname();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function criarTopico(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tituloLimpo = titulo.trim();
    const conteudoLimpo = conteudo.trim();
    const autorLimpo = autor.trim() || "Anônimo";
    const notaNumero = nota ? Number(nota) : null;

    if (!tituloLimpo || !conteudoLimpo) {
      setStatus({
        type: "error",
        message: "Preencha título e conteúdo.",
      });
      return;
    }

    if (notaNumero !== null && (notaNumero < 1 || notaNumero > 5)) {
      setStatus({
        type: "error",
        message: "A nota precisa estar entre 1 e 5.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      const nextPath = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const baseSlug = gerarSlug(tituloLimpo) || "topico";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from("forum_topics")
      .insert({
        titulo: tituloLimpo,
        conteudo: conteudoLimpo,
        autor: autorLimpo,
        nota: notaNumero,
        slug,
        category_id: category.id,
        clinic_id: category.clinic_id,
        user_id: user.id,
        oculto: false,
        fixado: false,
        trancado: false,
      })
      .select("id")
      .single();

    setLoading(false);

    if (error || !data) {
      setStatus({
        type: "error",
        message: getTopicErrorMessage(error?.message || ""),
      });
      return;
    }

    router.push(`/forum/topico/${data.id}`);
  }

  return (
    <form
      onSubmit={criarTopico}
      className="forum-form-card p-6"
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
            Categoria
          </label>
          <div className="forum-input flex items-center">
            {category.nome}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
            Autor / nickname
          </label>
          <input
            type="text"
            value={autor}
            onChange={(event) => setAutor(event.target.value)}
            placeholder="Anônimo"
            className="forum-input disabled:opacity-70"
            maxLength={32}
            disabled={Boolean(userId)}
          />
          <p className="mt-2 text-xs text-[#85859a]">
            {userId
              ? "Será publicado com o nickname da sua conta."
              : "Use um nickname. Seu e-mail nunca aparece no fórum."}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Digite o título do tópico"
            className="forum-input"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
            Conteúdo
          </label>
          <textarea
            value={conteudo}
            onChange={(event) => setConteudo(event.target.value)}
            rows={9}
            placeholder="Descreva sua dúvida, relato ou avaliação..."
            className="forum-textarea min-h-52"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
            Nota opcional
          </label>
          <select
            value={nota}
            onChange={(event) => setNota(event.target.value)}
            className="forum-select"
          >
            <option value="">Sem nota</option>
            <option value="1">1 - Ruim</option>
            <option value="2">2 - Regular</option>
            <option value="3">3 - Boa</option>
            <option value="4">4 - Muito boa</option>
            <option value="5">5 - Excelente</option>
          </select>
        </div>

        {status ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              status.type === "error"
                ? "border-[#ff5555]/40 bg-[#ff5555]/10 text-[#ffb4b4]"
                : "border-[#50fa7b]/40 bg-[#50fa7b]/10 text-[#b8ffc8]"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="create-topic-button w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {loading ? "Publicando..." : "Publicar tópico"}
        </button>
      </div>
    </form>
  );
}

function getTopicErrorMessage(message: string) {
  if (message.includes("topic_rate_limit")) {
    return "Aguarde alguns segundos antes de criar outro tópico.";
  }

  if (message.includes("login_required")) {
    return "Entre na sua conta para criar tópicos.";
  }

  return "Não foi possível criar o tópico agora.";
}
