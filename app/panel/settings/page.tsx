"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [subdomain, setSubdomain] = useState("");

  const save = async () => {
    await fetch("/api/store/update-subdomain", {
      method: "POST",
      body: JSON.stringify({ subdomain }),
      headers: { "Content-Type": "application/json" },
    });

    alert("Subdomínio atualizado!");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Configurar loja</h1>

      <label className="block font-semibold mb-1">
        Subdomínio:
      </label>

      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="ex: acai-brasil"
        value={subdomain}
        onChange={(e) => setSubdomain(e.target.value)}
      />

      <button
        onClick={save}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Salvar
      </button>
    </div>
  );
}
