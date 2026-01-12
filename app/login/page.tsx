"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Store, Loader2 } from "lucide-react";
import { getMyStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    try {
      /* ===============================
         LOGIN
      =============================== */
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔥 cookie httpOnly
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Erro ao entrar");
        return;
      }

      /* ===============================
         🔥 PASSO MAIS IMPORTANTE
         👉 inicializa/cria a loja
      =============================== */
      const store = await getMyStore();

      // opcional (mas útil pra debug/local)
      localStorage.setItem("tifra_store", JSON.stringify(store));

      /* ===============================
         REDIRECT FINAL
      =============================== */
      router.replace("/panel");
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro inesperado ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black/5 via-white to-black/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* LOGO */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white shadow-lg">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">TIFRA</h1>
          <p className="text-gray-500">
            Sistema de gestão para lojistas
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-center">
            Entrar na conta
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Digite suas credenciais para acessar o painel
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* SENHA */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 rounded-md border px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-black text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* REGISTER */}
          <p className="text-sm text-center text-gray-500 mt-4">
            Não tem uma conta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-black font-medium hover:underline"
            >
              Criar conta
            </button>
          </p>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-400">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
}
