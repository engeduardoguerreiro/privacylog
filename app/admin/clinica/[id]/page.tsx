"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

type ClinicaForm = {
  id?: number;
  nome?: string | null;
  contato?: string | null;
  site?: string | null;
  forum?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  tipo?: string | null;
  plano?: string | null;
  preco_30_normal?: number | string | null;
  preco_30_forista?: number | string | null;
  preco_60_normal?: number | string | null;
  preco_60_forista?: number | string | null;
};

export default function EditClinica() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [form, setForm] = useState<ClinicaForm | null>(null);
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

      setForm({
        ...data,
        tipo: data.tipo || "clinica",
        plano: data.plano || "free",
        site: data.site || "",
        forum: data.forum || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        estado: data.estado || "SP",
        contato: data.contato || "",
      });

      setLoading(false);
    };

    if (id) load();
  }, [id, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((current) =>
      current ? { ...current, [name]: value } : current
    );
  };

  const handleUpdate = async () => {
    if (!form) {
      return;
    }

    const { error } = await supabase
      .from("clinicas")
      .update({
        nome: form.nome,
        contato: form.contato,
        site: form.site || null,
        forum: form.forum || null,
        endereco: form.endereco,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        lat: Number(form.lat),
        lng: Number(form.lng),

        tipo: form.tipo,
        plano: form.plano,

        preco_30_normal: Number(form.preco_30_normal) || null,
        preco_30_forista: Number(form.preco_30_forista) || null,
        preco_60_normal: Number(form.preco_60_normal) || null,
        preco_60_forista: Number(form.preco_60_forista) || null,
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
      <h1 style={title}>Editar Clínica</h1>

      <div style={card}>
        <input
          name="nome"
          placeholder="Nome"
          value={form.nome || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="contato"
          placeholder="WhatsApp / contato"
          value={form.contato || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="site"
          placeholder="Site"
          value={form.site || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="forum"
          placeholder="Link fórum"
          value={form.forum || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="endereco"
          placeholder="Endereço"
          value={form.endereco || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="bairro"
          placeholder="Bairro"
          value={form.bairro || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="cidade"
          placeholder="Cidade"
          value={form.cidade || ""}
          onChange={handleChange}
          style={input}
        />

        <select
          name="estado"
          value={form.estado || "SP"}
          onChange={handleChange}
          style={input}
        >
          <option value="SP">São Paulo</option>
          <option value="MG">Minas Gerais</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="PR">Paraná</option>
          <option value="SC">Santa Catarina</option>
          <option value="RS">Rio Grande do Sul</option>
        </select>

        <input
          name="lat"
          placeholder="Latitude"
          value={form.lat || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="lng"
          placeholder="Longitude"
          value={form.lng || ""}
          onChange={handleChange}
          style={input}
        />

        <select
          name="tipo"
          value={form.tipo || "clinica"}
          onChange={handleChange}
          style={input}
        >
          <option value="clinica">Clínica</option>
          <option value="massagem">Massagem</option>
          <option value="boate">Boate</option>
          <option value="prive">Privê</option>
        </select>

        <select
          name="plano"
          value={form.plano || "free"}
          onChange={handleChange}
          style={input}
        >
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>

        <input
          name="preco_30_normal"
          placeholder="Preço 30 min normal"
          value={form.preco_30_normal || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="preco_30_forista"
          placeholder="Preço 30 min forista"
          value={form.preco_30_forista || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="preco_60_normal"
          placeholder="Preço 60 min normal"
          value={form.preco_60_normal || ""}
          onChange={handleChange}
          style={input}
        />

        <input
          name="preco_60_forista"
          placeholder="Preço 60 min forista"
          value={form.preco_60_forista || ""}
          onChange={handleChange}
          style={input}
        />

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

const title: React.CSSProperties = {
  color: "#bd93f9",
  marginBottom: 20,
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
