"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleRegister() {
    if (loading) return;

    if (!form.name || !form.email || !form.password) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Erro ao criar conta");
        return;
      }

      alert("Conta criada com sucesso 🚀");
      router.push("/login");
    } catch (err) {
      console.error("Erro no registro:", err);
      alert("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">
          Criar conta
        </h1>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Nome</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Seu nome"
            className="w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className="w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Senha</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full h-11 rounded-md bg-black text-white text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Já tem conta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-black font-medium hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
