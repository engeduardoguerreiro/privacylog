"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  nome: string;
  descricao: string;
  contato: string;
  site: string;
  forum: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  lat: string;
  lng: string;
  preco_30_normal: string;
  preco_30_forista: string;
  preco_60_normal: string;
  preco_60_forista: string;
  tipo: string;
  plano: string;
  weekday_open: string;
  weekday_close: string;
  saturday_open: string;
  saturday_close: string;
  sunday_open: string;
  sunday_close: string;
  imagens: string;
};

const initialForm: FormState = {
  nome: "",
  descricao: "",
  contato: "",
  site: "",
  forum: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "SP",
  lat: "",
  lng: "",
  preco_30_normal: "",
  preco_30_forista: "",
  preco_60_normal: "",
  preco_60_forista: "",
  tipo: "clinica",
  plano: "free",
  weekday_open: "",
  weekday_close: "",
  saturday_open: "",
  saturday_close: "",
  sunday_open: "",
  sunday_close: "",
  imagens: "",
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);

  function criarSlug(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const imagensArray = form.imagens
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);

    const novaClinica = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      contato: form.contato.trim(),
      site: form.site.trim() || null,
      forum: form.forum.trim() || null,
      endereco: form.endereco.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado,
      lat: Number(form.lat),
      lng: Number(form.lng),
      preco_30_normal: Number(form.preco_30_normal) || null,
      preco_30_forista: Number(form.preco_30_forista) || null,
      preco_60_normal: Number(form.preco_60_normal) || null,
      preco_60_forista: Number(form.preco_60_forista) || null,
      tipo: form.tipo,
      plano: form.plano,
      horarios: {
        weekday: [{ open: form.weekday_open, close: form.weekday_close }],
        saturday: [{ open: form.saturday_open, close: form.saturday_close }],
        sunday: [{ open: form.sunday_open, close: form.sunday_close }],
      },
      imagens: JSON.stringify(imagensArray, null, 2),
    };

    const { data: clinicData, error: clinicError } = await supabase
      .from("clinicas")
      .insert([novaClinica])
      .select("id, nome, estado, tipo")
      .single();

    if (clinicError || !clinicData) {
      console.error("ERRO AO CADASTRAR LOCAL:", clinicError);
      alert(`Erro ao cadastrar local: ${clinicError?.message}`);
      setSaving(false);
      return;
    }

    const { data: parentCategory, error: parentError } = await supabase
      .from("forum_categories")
      .select("id")
      .eq("estado", form.estado)
      .eq("tipo", form.tipo)
      .is("clinic_id", null)
      .limit(1)
      .maybeSingle();

    if (parentError || !parentCategory) {
      console.error("ERRO CATEGORIA PAI:", parentError);
      alert(
        "Local cadastrado, mas não encontrei a categoria do fórum para esse estado e tipo."
      );
      setSaving(false);
      return;
    }

    const slugClinica = `${form.tipo}-${clinicData.id}-${criarSlug(
      clinicData.nome
    )}`;

    const { data: forumCategory, error: forumError } = await supabase
      .from("forum_categories")
      .insert([
        {
          nome: clinicData.nome,
          slug: slugClinica,
          descricao: `Discussões e avaliações sobre ${clinicData.nome}`,
          parent_id: parentCategory.id,
          clinic_id: clinicData.id,
          estado: form.estado,
          tipo: form.tipo,
        },
      ])
      .select("id")
      .single();

    if (forumError || !forumCategory) {
      console.error("ERRO AO CRIAR SUBCATEGORIA:", forumError);
      alert(
        "Local cadastrado, mas ocorreu erro ao criar a subcategoria no fórum."
      );
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("clinicas")
      .update({
        forum: `/forum/categoria/${forumCategory.id}`,
      })
      .eq("id", clinicData.id);

    if (updateError) {
      console.error("ERRO AO ATUALIZAR LINK DO FÓRUM:", updateError);
      alert(
        "Subcategoria criada, mas ocorreu erro ao salvar o link do fórum no local."
      );
      setSaving(false);
      return;
    }

    alert("Cadastro concluído e subcategoria criada no fórum!");
    setForm(initialForm);
    setSaving(false);
  }

  const inputStyle: CSSProperties = {
    height: 54,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#0F0F16",
    color: "#fff",
    padding: "0 18px",
    fontSize: 15,
    outline: "none",
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: 120,
    padding: "16px 18px",
    resize: "vertical",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050507",
        color: "#fff",
        padding: "50px 24px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 42,
            marginBottom: 10,
            fontWeight: 700,
            color: "#A78BFA",
          }}
        >
          Painel Admin
        </h1>

        <p style={{ color: "#8a8aa3", marginBottom: 36 }}>
          Cadastro de locais PrivacyLog
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input
            name="nome"
            placeholder="Nome do local"
            value={form.nome}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <textarea
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={handleChange}
            style={textareaStyle}
          />

          <input
            name="contato"
            placeholder="WhatsApp / contato"
            value={form.contato}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="site"
            placeholder="Site"
            value={form.site}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="forum"
            placeholder="Link do fórum (opcional, será criado automático)"
            value={form.forum}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="endereco"
            placeholder="Endereço"
            value={form.endereco}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="bairro"
            placeholder="Bairro"
            value={form.bairro}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="cidade"
            placeholder="Cidade"
            value={form.cidade}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            style={inputStyle}
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
            value={form.lat}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="lng"
            placeholder="Longitude"
            value={form.lng}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="clinica">Clínica</option>
            <option value="massagem">Massagem</option>
            <option value="boate">Boate</option>
            <option value="prive">Privê</option>
          </select>

          <select
            name="plano"
            value={form.plano}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>

          <input
            name="preco_30_normal"
            placeholder="Preço 30 min normal"
            value={form.preco_30_normal}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="preco_30_forista"
            placeholder="Preço 30 min forista"
            value={form.preco_30_forista}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="preco_60_normal"
            placeholder="Preço 60 min normal"
            value={form.preco_60_normal}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="preco_60_forista"
            placeholder="Preço 60 min forista"
            value={form.preco_60_forista}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="weekday_open"
            placeholder="Seg-Sex abre. Ex: 10:00"
            value={form.weekday_open}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="weekday_close"
            placeholder="Seg-Sex fecha. Ex: 22:00"
            value={form.weekday_close}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="saturday_open"
            placeholder="Sábado abre. Ex: 10:00"
            value={form.saturday_open}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="saturday_close"
            placeholder="Sábado fecha. Ex: 20:00"
            value={form.saturday_close}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="sunday_open"
            placeholder="Domingo abre. Ex: 10:00"
            value={form.sunday_open}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="sunday_close"
            placeholder="Domingo fecha. Ex: 18:00"
            value={form.sunday_close}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="imagens"
            placeholder="/clinicas/1_01.webp, /clinicas/1_02.webp, /clinicas/1_03.webp"
            value={form.imagens}
            onChange={handleChange}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              height: 58,
              border: "none",
              borderRadius: 16,
              background: "linear-gradient(135deg,#8B5CF6,#7C3AED)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: saving ? "not-allowed" : "pointer",
              marginTop: 10,
              opacity: saving ? 0.7 : 1,
              boxShadow: "0 10px 30px rgba(124,92,255,0.35)",
            }}
          >
            {saving ? "Salvando..." : "Salvar local"}
          </button>
        </form>
      </div>
    </main>
  );
}
