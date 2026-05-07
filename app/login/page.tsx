"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erro no login: " + error.message);
      return;
    }

    router.push("/admin");
  };

  return (
    <div style={page}>
      <h1>Login Admin</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <input
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={input}
      />

      <button onClick={handleLogin} style={btn} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </div>
  );
}

const page: React.CSSProperties = {
  background: "#0f0f0f",
  color: "#fff",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
};

const input: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  width: 260,
};

const btn: React.CSSProperties = {
  padding: 10,
  background: "#6D28D9",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  width: 260,
};