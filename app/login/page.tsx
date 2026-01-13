"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInOrSignUp } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    try {
      if (!email || !password) {
        alert("Preencha e-mail e senha");
        return;
      }

      // 🔐 1️⃣ LOGIN (gera cookie httpOnly)
      const user = await signInOrSignUp(email, password);

      if (!user?.id) {
        throw new Error("Usuário inválido");
      }

      // 🏪 2️⃣ BOOTSTRAP DO SISTEMA
      // ESSA CHAMADA:
      // - valida o cookie
      // - cria loja se não existir
      const { store } = await apiFetch("/api/store/me");

      if (!store?.id) {
        throw new Error("Erro ao carregar loja");
      }

      // 💾 3️⃣ Cache local (só UI)
      localStorage.setItem("tifra_user", JSON.stringify(user));
      localStorage.setItem("tifra_store", JSON.stringify(store));

      // 🚀 4️⃣ Redirect
      router.replace("/panel");

    } catch (err: any) {
      alert(err.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white border rounded-lg w-80 space-y-3 shadow">
        <h2 className="text-xl font-bold text-center">Login do Lojista</h2>

        <input
          className="w-full border px-2 py-1 rounded"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border px-2 py-1 rounded"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="w-full text-blue-600 underline"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
