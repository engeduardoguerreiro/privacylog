"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function EditClinica() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("clinicas")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Clínica não encontrada");
        router.push("/admin/dashboard");
        return;
      }

      setForm(data);
      setLoading(false);
    };

    if (id) load();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("clinicas")
      .update({
        nome: form.nome,
        contato: form.contato,
        site: form.site,
        forum: form.forum,
        endereco: form.endereco,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        lat: Number(form.lat),
        lng: Number(form.lng),
        tipo: form.tipo,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar");
      console.error(error);
      return;
    }

    alert("Atualizado com sucesso!");
    router.push("/admin/dashboard");
  };

  if (loading || !form) return <div style={page}>carregando...</div>;

  return (
    <div style={page}>

      <h1>Editar Clínica</h1>

      <div style={card}>

        <input name="nome" value={form.nome} onChange={handleChange} style={input} />
        <input name="contato" value={form.contato} onChange={handleChange} style={input} />

        <input name="site" value={form.site} onChange={handleChange} style={input} />
        <input name="forum" value={form.forum} onChange={handleChange} style={input} />

        <input name="endereco" value={form.endereco} onChange={handleChange} style={input} />
        <input name="bairro" value={form.bairro} onChange={handleChange} style={input} />
        <input name="cidade" value={form.cidade} onChange={handleChange} style={input} />
        <input name="estado" value={form.estado} onChange={handleChange} style={input} />

        <input name="lat" value={form.lat} onChange={handleChange} style={input} />
        <input name="lng" value={form.lng} onChange={handleChange} style={input} />

        <select name="tipo" value={form.tipo} onChange={handleChange} style={input}>
          <option value="free">free</option>
          <option value="premium">premium</option>
        </select>

        <button onClick={handleUpdate} style={btn}>
          salvar alterações
        </button>

      </div>
    </div>
  );
}

/* STYLE */

const page: React.CSSProperties = {
  background: "#0b0b10",
  color: "#fff",
  minHeight: "100vh",
  padding: 20,
  fontFamily: "monospace",
};

const card: React.CSSProperties = {
  background: "#14141f",
  padding: 20,
  borderRadius: 10,
  maxWidth: 500,
  border: "1px solid #282a36",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #44475a",
  background: "#0f0f17",
  color: "#fff",
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: 12,
  background: "#50fa7b",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};