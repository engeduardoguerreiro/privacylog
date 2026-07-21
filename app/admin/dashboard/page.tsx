"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ClinicaAdmin = {
  id: number;
  nome: string | null;
  cidade: string | null;
  estado: string | null;
  tipo: string | null;
  plano: string | null;
};

const categoryOrder = [
  { key: "clinica", label: "Clínicas" },
  { key: "massagem", label: "Massagens" },
  { key: "boate", label: "Boates" },
  { key: "prive", label: "Privês" },
  { key: "sem tipo", label: "Sem categoria" },
];

export default function Dashboard() {
  const router = useRouter();
  const [clinicas, setClinicas] = useState<ClinicaAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("clinicas").select("*");

      if (error) {
        console.error(error);
      }

      setClinicas(sortClinics((data || []) as ClinicaAdmin[]));
      setLoading(false);
    };

    load();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = confirm("Deseja deletar esta clínica?");
    if (!ok) return;

    const { error } = await supabase.from("clinicas").delete().eq("id", id);

    if (error) {
      alert("Erro ao deletar clínica");
      console.error(error);
      return;
    }

    setClinicas((prev) => prev.filter((clinic) => clinic.id !== id));
  };

  if (loading) return <div style={page}>Carregando...</div>;

  return (
    <div style={page}>
      <h1 style={title}>Dashboard Lounge</h1>
      <p style={description}>
        Locais agrupados por categoria e ordenados em ordem alfabética.
      </p>

      <div style={sectionStack}>
        {categoryOrder.map((category) => {
          const items = clinicas.filter(
            (clinic) => normalizeType(clinic.tipo) === category.key
          );

          if (items.length === 0) {
            return null;
          }

          return (
            <section key={category.key} style={section}>
              <div style={sectionHeader}>
                <h2 style={sectionTitle}>{category.label}</h2>
                <span style={sectionCount}>{items.length} locais</span>
              </div>

              <div style={grid}>
                {items.map((clinic) => (
                  <div key={clinic.id} style={card}>
                    <div style={headerCard}>
                      <h3 style={name}>{clinic.nome}</h3>
                      <span style={badgePlano(clinic.plano || "free")}>
                        {(clinic.plano || "free").toUpperCase()}
                      </span>
                    </div>

                    <div style={infoRow}>
                      <span style={badgeTipo(clinic.tipo || "sem tipo")}>
                        {category.label}
                      </span>
                    </div>

                    <p style={sub}>
                      {clinic.cidade} {clinic.estado ? `- ${clinic.estado}` : ""}
                    </p>

                    <p style={id}>ID: {clinic.id}</p>

                    <div style={actions}>
                      <button
                        onClick={() => router.push(`/clinica/${clinic.id}`)}
                        style={btnView}
                      >
                        ver
                      </button>

                      <button
                        onClick={() => router.push(`/admin/clinica/${clinic.id}`)}
                        style={btnEdit}
                      >
                        editar
                      </button>

                      <button
                        onClick={() => handleDelete(clinic.id)}
                        style={btnDelete}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function sortClinics(items: ClinicaAdmin[]) {
  return [...items].sort((a, b) => {
    const typeA = categoryIndex(normalizeType(a.tipo));
    const typeB = categoryIndex(normalizeType(b.tipo));

    if (typeA !== typeB) {
      return typeA - typeB;
    }

    return (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
      sensitivity: "base",
    });
  });
}

function normalizeType(tipo: string | null) {
  return tipo || "sem tipo";
}

function categoryIndex(tipo: string) {
  const index = categoryOrder.findIndex((category) => category.key === tipo);

  return index === -1 ? categoryOrder.length : index;
}

const page: React.CSSProperties = {
  background: "#0b0b10",
  minHeight: "100vh",
  color: "#f8f8f2",
  padding: 20,
  fontFamily: "monospace",
};

const title: React.CSSProperties = {
  color: "#bd93f9",
  marginBottom: 8,
};

const description: React.CSSProperties = {
  color: "#8a8aa3",
  marginBottom: 24,
  fontSize: 14,
};

const sectionStack: React.CSSProperties = {
  display: "grid",
  gap: 30,
};

const section: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  borderBottom: "1px solid #282a36",
  paddingBottom: 10,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  color: "#f8f8f2",
  fontSize: 22,
};

const sectionCount: React.CSSProperties = {
  color: "#bd93f9",
  fontSize: 12,
  fontWeight: 700,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 15,
};

const card: React.CSSProperties = {
  background: "#14141f",
  border: "1px solid #282a36",
  borderRadius: 10,
  padding: 15,
};

const headerCard: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const name: React.CSSProperties = {
  margin: 0,
  color: "#f8f8f2",
  fontSize: 16,
};

const infoRow: React.CSSProperties = {
  marginTop: 10,
};

const sub: React.CSSProperties = {
  fontSize: 12,
  color: "#6272a4",
  marginTop: 8,
};

const id: React.CSSProperties = {
  fontSize: 10,
  color: "#44475a",
  marginTop: 4,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 12,
};

const btnView: React.CSSProperties = {
  flex: 1,
  padding: 6,
  background: "#6272a4",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
};

const btnEdit: React.CSSProperties = {
  flex: 1,
  padding: 6,
  background: "#bd93f9",
  border: "none",
  borderRadius: 6,
  color: "#000",
  cursor: "pointer",
};

const btnDelete: React.CSSProperties = {
  flex: 1,
  padding: 6,
  background: "#ff5555",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
};

const badgePlano = (plano: string): React.CSSProperties => {
  const isPremium = plano === "premium";

  return {
    fontSize: 10,
    padding: "4px 7px",
    borderRadius: 6,
    background: isPremium ? "#f1fa8c" : "#44475a",
    color: isPremium ? "#000" : "#f8f8f2",
    whiteSpace: "nowrap",
  };
};

const badgeTipo = (tipo: string): React.CSSProperties => {
  const colorByTipo: Record<string, string> = {
    clinica: "#8be9fd",
    massagem: "#50fa7b",
    boate: "#ff79c6",
    prive: "#ffb86c",
  };

  return {
    display: "inline-block",
    fontSize: 10,
    padding: "4px 7px",
    borderRadius: 6,
    background: "#282a36",
    color: colorByTipo[tipo] || "#8be9fd",
    border: "1px solid #44475a",
  };
};
