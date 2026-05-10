"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResponderTopico({
  topicId,
  locked,
}: {
  topicId: number;
  locked: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function responder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const conteudoLimpo = conteudo.trim();

    if (!conteudoLimpo) {
      setErrorMessage("Digite uma resposta antes de enviar.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    const { error } = await supabase.from("forum_replies").insert({
      topic_id: topicId,
      conteudo: conteudoLimpo,
      user_id: user.id,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(getReplyErrorMessage(error.message));
      return;
    }

    setConteudo("");
    router.refresh();
  }

  if (locked) {
    return (
      <section className="mt-6 rounded-lg border border-[#44475a] bg-[#0f0f16] p-6 text-[#b8b8c7]">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Lock size={18} />
          Tópico travado
        </div>
        <p className="mt-2 text-sm text-[#9ca3af]">
          Novas respostas estão desativadas neste tópico.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={responder}
      className="mt-6 rounded-lg border border-[#282a36] bg-[#0f0f16] p-6 md:p-8"
    >
      <h2 className="mb-4 text-2xl font-black text-white">Responder tópico</h2>

      <textarea
        value={conteudo}
        onChange={(event) => setConteudo(event.target.value)}
        rows={6}
        placeholder="Escreva sua resposta..."
        className="min-h-40 w-full resize-y rounded-lg border border-[#44475a] bg-[#07070d] px-4 py-3 text-white outline-none transition placeholder:text-[#6272a4] focus:border-[#bd93f9]"
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
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#bd93f9] px-6 py-3 font-bold text-black transition hover:bg-[#d6bcff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={18} />
        {loading ? "Enviando..." : "Enviar resposta"}
      </button>
    </form>
  );
}

function getReplyErrorMessage(message: string) {
  if (message.includes("reply_rate_limit")) {
    return "Aguarde alguns segundos antes de responder novamente.";
  }

  if (message.includes("login_required")) {
    return "Entre na sua conta para responder.";
  }

  return "Não foi possível enviar a resposta agora.";
}
