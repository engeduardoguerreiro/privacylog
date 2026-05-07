"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nome: "",
    contato: "",
    site: "",
    forum: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    lat: "",
    lng: "",
    preco_30_normal: "",
    preco_30_forista: "",
    preco_60_normal: "",
    preco_60_forista: "",
    tipo: "free",

    weekday_open: "",
    weekday_close: "",
    saturday_open: "",
    saturday_close: "",
    sunday_open: "",
    sunday_close: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) router.push("/login");
      else setLoading(false);
    };

    checkAuth();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const horario = {
      weekday: [{ open: form.weekday_open, close: form.weekday_close }],
      saturday: [{ open: form.saturday_open, close: form.saturday_close }],
      sunday: [{ open: form.sunday_open, close: form.sunday_close }],
    };

    const { error } = await supabase.from("clinicas").insert([
      {
        ...form,
        lat: Number(form.lat),
        lng: Number(form.lng),
        preco_30_normal: Number(form.preco_30_normal),
        preco_30_forista: Number(form.preco_30_forista),
        preco_60_normal: Number(form.preco_60_normal),
        preco_60_forista: Number(form.preco_60_forista),
        horario,
      },
    ]);

    if (error) {
      alert("Erro ao salvar");
      console.error(error);
    } else {
      alert("Clínica cadastrada!");
    }
  };

  if (loading) {
    return <div style={page}>carregando auth...</div>;
  }

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>⚡ Admin Panel</h1>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          style={logout}
        >
          logout
        </button>
      </div>

      {/* FORM */}
      <div style={card}>

        <div style={sectionTitle}>// clinic_data</div>

        <input name="nome" placeholder="nome_clinica" onChange={handleChange} style={input} />
        <input name="contato" placeholder="whatsapp" onChange={handleChange} style={input} />

        <input name="site" placeholder="site_url" onChange={handleChange} style={input} />
        <input name="forum" placeholder="forum_link" onChange={handleChange} style={input} />

        <select name="tipo" onChange={handleChange} style={input}>
          <option value="free">free</option>
          <option value="premium">premium</option>
        </select>

        <div style={sectionTitle}>// location</div>

        <input name="endereco" placeholder="endereco" onChange={handleChange} style={input} />
        <input name="bairro" placeholder="bairro" onChange={handleChange} style={input} />
        <input name="cidade" placeholder="cidade" onChange={handleChange} style={input} />
        <input name="estado" placeholder="estado" onChange={handleChange} style={input} />
        <input name="lat" placeholder="lat" onChange={handleChange} style={input} />
        <input name="lng" placeholder="lng" onChange={handleChange} style={input} />

        <div style={sectionTitle}>// horario</div>

        <input name="weekday_open" placeholder="seg-sex open" onChange={handleChange} style={input} />
        <input name="weekday_close" placeholder="seg-sex close" onChange={handleChange} style={input} />

        <input name="saturday_open" placeholder="sab open" onChange={handleChange} style={input} />
        <input name="saturday_close" placeholder="sab close" onChange={handleChange} style={input} />

        <input name="sunday_open" placeholder="dom open" onChange={handleChange} style={input} />
        <input name="sunday_close" placeholder="dom close" onChange={handleChange} style={input} />

        <div style={sectionTitle}>// pricing</div>

        <input name="preco_30_normal" placeholder="30min normal" onChange={handleChange} style={input} />
        <input name="preco_30_forista" placeholder="30min forista" onChange={handleChange} style={input} />

        <input name="preco_60_normal" placeholder="1h normal" onChange={handleChange} style={input} />
        <input name="preco_60_forista" placeholder="1h forista" onChange={handleChange} style={input} />

        <button onClick={handleSubmit} style={btn}>
          run insert()
        </button>

      </div>
    </div>
  );
}

/* ===== DRACULA STYLE ===== */

const page: React.CSSProperties = {
  background: "#0b0b10",
  minHeight: "100vh",
  color: "#f8f8f2",
  padding: 20,
  fontFamily: "monospace",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const title: React.CSSProperties = {
  color: "#bd93f9",
};

const logout: React.CSSProperties = {
  background: "#ff5555",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const card: React.CSSProperties = {
  background: "#14141f",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #282a36",
  maxWidth: 600,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #44475a",
  background: "#0f0f17",
  color: "#f8f8f2",
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: 12,
  background: "#50fa7b",
  color: "#000",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionTitle: React.CSSProperties = {
  color: "#6272a4",
  margin: "10px 0",
  fontSize: 12,
};