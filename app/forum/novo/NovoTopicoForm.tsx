"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ForumCategory } from "../forum-types";
import { gerarSlug } from "../forum-utils";

type FormStatus = {
  type: "error" | "success";
  message: string;
} | null;

export default function NovoTopicoForm({
  categorias,
  categoriaInicial,
}: {
  categorias: ForumCategory[];
  categoriaInicial: number | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const initialCategory = useMemo(() => {
    const exists = categorias.some(
      (category) => category.id === categoriaInicial
    );
    return exists && categoriaInicial ? String(categoriaInicial) : "";
  }, [categorias, categoriaInicial]);

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  async function criarTopico(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tituloLimpo = titulo.trim();
    const conteudoLimpo = conteudo.trim();

    if (!tituloLimpo || !conteudoLimpo || !categoryId) {
      setStatus({
        type: "error",
        message: "Preencha categoria, título e conteúdo.",
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
        slug,
        category_id: Number(categoryId),
        user_id: user.id,
      })
      .select("slug")
      .single();

    setLoading(false);

    if (error) {
      setStatus({
        type: "error",
        message: "Não foi possível criar o tópico agora.",
      });
      return;
    }

    router.push(`/forum/${data?.slug || slug}`);
  }

  return (
    <form
      onSubmit={criarTopico}
      className="rounded-lg border border-[#282a36] bg-[#0f0f16] p-6"
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c7]">
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-lg border border-[#44475a] bg-[#07070d] px-4 py-3 text-white outline-none transition focus:border-[#bd93f9]"
            required
          >
            <option value="">Selecione</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c7]">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Digite o título do tópico"
            className="w-full rounded-lg border border-[#44475a] bg-[#07070d] px-4 py-3 text-white outline-none transition placeholder:text-[#6272a4] focus:border-[#bd93f9]"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#b8b8c7]">
            Conteúdo
          </label>
          <textarea
            value={conteudo}
            onChange={(event) => setConteudo(event.target.value)}
            rows={9}
            placeholder="Descreva sua dúvida, relato ou recomendação..."
            className="min-h-52 w-full resize-y rounded-lg border border-[#44475a] bg-[#07070d] px-4 py-3 text-white outline-none transition placeholder:text-[#6272a4] focus:border-[#bd93f9]"
            required
          />
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#bd93f9] px-5 py-4 font-bold text-black transition hover:bg-[#d6bcff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {loading ? "Publicando..." : "Publicar tópico"}
        </button>
      </div>
    </form>
  );
}
