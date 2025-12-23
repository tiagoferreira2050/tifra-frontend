"use client";

import { useEffect, useState } from "react";
import { generateSubdomain } from "@/lib/generateSubdomain";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Carrega dados da loja
  useEffect(() => {
    async function loadStore() {
      const res = await fetch("/api/store/me");
      const data = await res.json();

      setStoreName(data.name);
      setSubdomain(data.subdomain || generateSubdomain(data.name));
    }

    loadStore();
  }, []);

  const save = async () => {
    setLoading(true);

    await fetch("/api/store/update-subdomain", {
      method: "POST",
      body: JSON.stringify({ subdomain }),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);
    alert("Subdomínio atualizado!");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configuração da Loja</h1>

      {/* NOME DA LOJA */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">
          Nome da loja
        </label>
        <input
          className="border rounded px-3 py-2 w-full bg-gray-100"
          value={storeName}
          disabled
        />
      </div>

      {/* SUBDOMÍNIO */}
      <div className="mb-2">
        <label className="block text-sm font-semibold mb-1">
          Subdomínio
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={subdomain}
          onChange={(e) =>
            setSubdomain(generateSubdomain(e.target.value))
          }
        />
      </div>

      {/* PREVIEW */}
      <p className="text-xs text-gray-600 mb-4">
        Seu site ficará em:{" "}
        <span className="font-semibold">
          https://{subdomain}.tifra.com.br
        </span>
      </p>

      <button
        onClick={save}
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 rounded-lg disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
