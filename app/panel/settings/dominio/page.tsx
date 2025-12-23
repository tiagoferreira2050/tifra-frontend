"use client";

import { useEffect, useState } from "react";
import { generateSubdomain } from "@/lib/generateSubdomain";
import { apiFetch } from "@/lib/api";

export default function DomainSettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStore() {
      const data = await apiFetch("/store/me");
      setStoreName(data.name);
      setSubdomain(data.subdomain);
    }

    loadStore().catch(() => {
      alert("Erro ao carregar dados da loja");
    });
  }, []);

  async function save() {
    try {
      setLoading(true);
      await apiFetch("/store/update-subdomain", {
        method: "POST",
        body: JSON.stringify({ subdomain }),
      });
      alert("Subdomínio atualizado com sucesso!");
    } catch {
      alert("Erro ao atualizar subdomínio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Domínio da Loja</h1>

      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
        ⚠️ Alterar o subdomínio muda o endereço do seu site.
        Links antigos deixarão de funcionar.
      </p>

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

      <p className="text-xs text-gray-600 mb-4">
        Seu site ficará em{" "}
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
