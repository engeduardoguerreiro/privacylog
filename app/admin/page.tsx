"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [form, setForm] = useState({
    nome: "",
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
    weekday_open: "",
    weekday_close: "",
    saturday_open: "",
    saturday_close: "",
    sunday_open: "",
    sunday_close: "",
    imagens: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const imagensArray = form.imagens
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);

    const novaClinica = {
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
      preco_30_normal: Number(form.preco_30_normal) || null,
      preco_30_forista: Number(form.preco_30_forista) || null,
      preco_60_normal: Number(form.preco_60_normal) || null,
      preco_60_forista: Number(form.preco_60_forista) || null,
      tipo: form.tipo,
      horarios: {
        weekday: [
          {
            open: form.weekday_open,
            close: form.weekday_close,
          },
        ],
        saturday: [
          {
            open: form.saturday_open,
            close: form.saturday_close,
          },
        ],
        sunday: [
          {
            open: form.sunday_open,
            close: form.sunday_close,
          },
        ],
      },
      imagens: imagensArray,
    };

    const { data, error } = await supabase
      .from("clinicas")
      .insert([novaClinica])
      .select();

    if (error) {
      console.error("ERRO SUPABASE:", error);
      alert(`Erro ao cadastrar: ${error.message}`);
      return;
    }

    console.log("SALVO:", data);
    alert("Clínica cadastrada com sucesso!");

    setForm({
      nome: "",
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
      weekday_open: "",
      weekday_close: "",
      saturday_open: "",
      saturday_close: "",
      sunday_open: "",
      sunday_close: "",
      imagens: "",
    });
  }

  const inputStyle: React.CSSProperties = {
    height: 54,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#0F0F16",
    color: "#fff",
    padding: "0 18px",
    fontSize: 15,
    outline: "none",
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
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
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

        <p
          style={{
            color: "#8a8aa3",
            marginBottom: 36,
          }}
        >
          Cadastro de clínicas Privacy Log
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <input
            name="nome"
            placeholder="Nome da clínica"
            value={form.nome}
            onChange={handleChange}
            style={inputStyle}
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
            placeholder="Link do fórum"
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
            <option value="premium">Premium</option>
            <option value="free">Free</option>
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
            style={{
              height: 58,
              border: "none",
              borderRadius: 16,
              background: "linear-gradient(135deg,#8B5CF6,#7C3AED)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              marginTop: 10,
              boxShadow: "0 10px 30px rgba(124,92,255,0.35)",
            }}
          >
            Salvar clínica
          </button>
        </form>
      </div>
    </main>
  );
}