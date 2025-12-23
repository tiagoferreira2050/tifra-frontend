"use client";

import { useEffect, useState } from "react";
import { generateSubdomain } from "@/lib/generateSubdomain";

export default function DomainSettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 CARREGA DADOS DA LOJA
  useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stores/me`,
          {
            headers: {
              "x-user-id": localStorage.getItem("userId") || "",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Erro ao carregar loja");
        }

        const data = await res.json();

        setStoreName(data.name);
        setSubdomain(
          data.subdomain || generateSubdomain(data.name)
        );
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados da loja");
      }
    }

    loadStore();
  }, []);

  // 🔹 SALVAR SUBDOMÍNIO
  const save = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stores/update-subdomain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": localStorage.getItem("userId") || "",
          },
          body: JSON.stringify({ subdomain }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar");
      }

      alert("Subdomínio atualizado com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao atualizar subdomínio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Domínio da Loja
      </h1>

      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
        ⚠️ Alterar o subdomínio muda o endereço do seu site.
        Links antigos deixarão de funcionar.
      </p>

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
