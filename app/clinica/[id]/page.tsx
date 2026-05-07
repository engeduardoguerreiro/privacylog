import { supabase } from "@/lib/supabase";
import { Globe, MessageCircle, MessageSquare, Car } from "lucide-react";

export default async function ClinicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const numericId = Number(id);

  if (!id || isNaN(numericId)) {
    return <div style={page}>ID inválido</div>;
  }

  const { data: clinic, error } = await supabase
    .from("clinicas")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error || !clinic) {
    return <div style={page}>Clínica não encontrada</div>;
  }

  // 📸 imagens automáticas
  const images = [
    `/clinicas/${clinic.id}_01.webp`,
    `/clinicas/${clinic.id}_02.webp`,
    `/clinicas/${clinic.id}_03.webp`,
  ];

  // 📱 WHATSAPP AGORA VEM DE "contato"
  const whatsappNumber = String(clinic.contato || "")
    .replace(/\D/g, "");

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={{ fontSize: 28 }}>{clinic.nome}</h1>

        <div style={actions}>

          {/* SITE */}
          <a href={clinic.site || "#"} target="_blank" style={btn}>
            <Globe size={16} /> Site
          </a>

          {/* WHATSAPP (AGORA CORRETO) */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            style={btn}
          >
            <MessageCircle size={16} /> WhatsApp
          </a>

          {/* FORUM */}
          <a href={clinic.forum || "#"} style={btn}>
            <MessageSquare size={16} /> Fórum
          </a>

          {/* UBER */}
          <a
            href={`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${clinic.lat}&dropoff[longitude]=${clinic.lng}`}
            target="_blank"
            style={btn}
          >
            <Car size={16} /> Uber
          </a>

        </div>
      </div>

      {/* FOTOS */}
      <div style={section}>
        <h2>Fotos</h2>

        <div style={grid}>
          {images.map((img, i) => (
            <img key={i} src={img} style={imgStyle} />
          ))}
        </div>
      </div>

      {/* ENDEREÇO */}
      <div style={section}>
        <h2>Endereço</h2>

        <div style={box}>
          {clinic.endereco}
          <br />
          {clinic.bairro}
          <br />
          {clinic.cidade} - {clinic.estado}
        </div>
      </div>

      {/* VALORES */}
      <div style={section}>
        <h2>Valores</h2>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Serviço</th>
              <th style={th}>Normal</th>
              <th style={th}>Forista</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={td}>30 min</td>
              <td style={td}>R$ {clinic.preco_30_normal ?? "—"}</td>
              <td style={td}>R$ {clinic.preco_30_forista ?? "—"}</td>
            </tr>

            <tr>
              <td style={td}>1 hora</td>
              <td style={td}>R$ {clinic.preco_60_normal ?? "—"}</td>
              <td style={td}>R$ {clinic.preco_60_forista ?? "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* STYLE */

const page: React.CSSProperties = {
  background: "#0f0f0f",
  minHeight: "100vh",
  color: "#fff",
  padding: 20,
};

const header: React.CSSProperties = {
  borderBottom: "1px solid #222",
  paddingBottom: 20,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 15,
  flexWrap: "wrap",
};

const btn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#1a1a1a",
  padding: "10px 14px",
  borderRadius: 10,
  color: "#fff",
  textDecoration: "none",
  fontSize: 14,
};

const section: React.CSSProperties = {
  marginTop: 25,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 10,
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: 120,
  objectFit: "cover",
  borderRadius: 10,
};

const box: React.CSSProperties = {
  background: "#1a1a1a",
  padding: 15,
  borderRadius: 10,
};

const table: React.CSSProperties = {
  width: "100%",
  background: "#1a1a1a",
  borderRadius: 10,
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  padding: 10,
  textAlign: "left",
  color: "#aaa",
};

const td: React.CSSProperties = {
  padding: 10,
  borderTop: "1px solid #333",
  color: "#ddd",
};