"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    try {
      setLoading(true);

      if (password.length < 3) {
        alert("A nova senha precisa ter pelo menos 3 caracteres.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        alert("Erro ao atualizar senha: " + error.message);
      } else {
        alert("Senha alterada com sucesso!");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 border rounded w-80 space-y-3">
        <h2 className="text-xl font-bold">Nova Senha</h2>

        <input
          type="password"
          className="w-full border px-2 py-1"
          placeholder="Digite a nova senha"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Salvando..." : "Salvar Senha"}
        </button>
      </div>
    </div>
  );
}
