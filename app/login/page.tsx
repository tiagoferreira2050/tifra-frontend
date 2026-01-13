"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInOrSignUp } from "@/lib/auth";
import { getStoreByUser } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    try {
      if (!email || !password) {
        alert("Preencha o e-mail e a senha.");
        return;
      }

      let user: any;

      try {
        user = await signInOrSignUp(email, password);

        console.log("🧩 Usuário logado →", user);
        console.log("🧩 user.id →", user?.id);

      } catch (err: any) {
        const msg = err.message?.toLowerCase() || "";

        if (msg.includes("invalid login credentials")) {
          alert("Senha incorreta ❌");
        } else if (
          msg.includes("user not found") ||
          msg.includes("invalid email")
        ) {
          alert("E-mail não encontrado ❌");
        } else {
          alert("Erro ao entrar: " + err.message);
        }
        return;
      }

      if (!user?.id) {
        alert("Erro inesperado: usuário inválido.");
        return;
      }

      // ✅ BUSCA A LOJA DO USUÁRIO
      const store = await getStoreByUser(user.id);

      if (!store?.id) {
        alert("Erro: loja não encontrada para este usuário.");
        return;
      }

      // ✅ DADOS LOCAIS (MANTIDOS)
      localStorage.setItem("tifra_user", JSON.stringify(user));
      localStorage.setItem("tifra_store", JSON.stringify(store));

      // 🔥🔥🔥 ESSENCIAL PARA TODO O SISTEMA
      localStorage.setItem("storeId", store.id);
// 🔥🔥🔥 ESSENCIAL PARA TODA A API
localStorage.setItem("tifra_user_id", user.id);

      // 🔥 REDIRECT CORRETO (SEM RELOAD DURO)
      router.replace("/panel");

    } catch (err: any) {
      alert("Erro ao entrar: " + err.message);
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
          className="w-full text-center text-blue-600 mt-2 underline"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
