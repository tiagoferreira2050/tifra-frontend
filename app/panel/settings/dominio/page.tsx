"use client";

import { useEffect, useState } from "react";
import { generateSubdomain } from "@/lib/generateSubdomain";
import { apiFetch } from "@/lib/api";

export default function DomainSettingsPage() {
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // 🔹 LOAD SUBDOMÍNIO ATUAL
  // ===============================
  useEffect(() => {
    async function loadStore() {
      try {
        const data = await apiFetch("/api/store/me");

        if (data?.subdomain) {
          setSubdomain(data.subdomain);
        }
      } catch (err) {
        console.error("Erro ao carregar subdomínio:", err);
        alert("Erro ao carregar subdomínio da loja");
      }
    }

    loadStore();
  }, []);

  // ===============================
  // 🔹 SAVE SUBDOMÍNIO
  // ===============================
  async function save() {
    const normalized = generateSubdomain(subdomain);

    if (!normalized) {
      alert("Subdomínio inválido");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/api/store/update-subdomain", {
        method: "PUT", // ✅ CORRETO (bate com o backend)
        body: JSON.stringify({
          subdomain: normalized,
        }),
      });

      setSubdomain(normalized);
      alert("Subdomínio atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar subdomínio:", err);
      alert("Erro ao atualizar subdomínio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Domínio da Loja
      </h1>

      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
        ⚠️ Alterar o subdomínio muda o endereço do seu site.
        Links antigos deixarão de funcionar.
      </p>

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
          https://{subdomain || "sualoja"}.tifra.com.br
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
