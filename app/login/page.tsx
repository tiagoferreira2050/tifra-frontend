"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebug(null);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", response.data);

      localStorage.setItem("token", response.data.token);
      router.push("/panel");
    } catch (err: any) {
      console.error("LOGIN ERROR FULL:", err);

      // Mensagem amigável
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erro desconhecido no login"
      );

      // DEBUG COMPLETO (visível na tela)
      setDebug({
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        stack: err?.stack,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Login (DEBUG)</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, color: "red" }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {debug && (
        <pre
          style={{
            marginTop: 16,
            background: "#111",
            color: "#0f0",
            padding: 12,
            fontSize: 12,
            overflow: "auto",
          }}
        >
{JSON.stringify(debug, null, 2)}
        </pre>
      )}
    </div>
  );
}
