"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResponderTopico({
  locked,
  topicId,
}: {
  locked: boolean;
  topicId: number;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [autor, setAutor] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  async function responder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const conteudoLimpo = conteudo.trim();
    const autorLimpo = autor.trim() || "Anônimo";

    if (!conteudoLimpo) {
      setErrorMessage("Digite uma resposta antes de enviar.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.from("forum_replies").insert({
      topic_id: topicId,
      conteudo: conteudoLimpo,
      autor: autorLimpo,
      user_id: userId,
      oculto: false,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Não foi possível enviar a resposta agora.");
      return;
    }

    setConteudo("");
    router.refresh();
  }

  if (locked) {
    return (
      <section className="forum-form-card mt-6 p-6 text-[#b8b8c8]">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Lock size={18} />
          Tópico trancado
        </div>
        <p className="mt-2 text-sm text-[#85859a]">
          Novas respostas estão desativadas neste tópico.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={responder}
      className="forum-form-card mt-6 p-6 md:p-8"
    >
      <h2 className="mb-4 text-2xl font-black text-white">Responder tópico</h2>

      <label className="mb-2 block text-sm font-semibold text-[#b8b8c8]">
        Autor / nickname
      </label>
      <input
        type="text"
        value={autor}
        onChange={(event) => setAutor(event.target.value)}
        placeholder="Anônimo"
        className="forum-input mb-4 disabled:opacity-70"
        maxLength={32}
        disabled={Boolean(userId)}
      />

      <textarea
        value={conteudo}
        onChange={(event) => setConteudo(event.target.value)}
        rows={6}
        placeholder="Escreva sua resposta..."
        className="forum-textarea"
        required
      />

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-[#ff5555]/40 bg-[#ff5555]/10 px-4 py-3 text-sm text-[#ffb4b4]">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="primary-button mt-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={18} />
        {loading ? "Enviando..." : "Enviar resposta"}
      </button>
    </form>
  );
}
