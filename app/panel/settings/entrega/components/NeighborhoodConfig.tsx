"use client";

import { useEffect, useState } from "react";

type Neighborhood = {
  id: string;
  neighborhood: string;
  city: string;
  fee: number;
  eta: string;
  active: boolean;
};

export default function NeighborhoodConfig() {
  const [items, setItems] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  /* ===============================
     🔄 LOAD
  =============================== */
  async function loadNeighborhoods() {
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/neighborhoods`,
      { credentials: "include" }
    );

    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  /* ===============================
     ➕ ADD
  =============================== */
  async function addNeighborhood() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/neighborhoods`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          neighborhood: "Novo bairro",
          city: "Minha cidade",
          fee: 0,
          eta: "30-40 min",
          active: true,
        }),
      }
    );

    if (res.ok) loadNeighborhoods();
  }

  /* ===============================
     💾 UPDATE
  =============================== */
  async function updateNeighborhood(
    id: string,
    payload: Partial<Neighborhood>
  ) {
    setSaving(id);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/neighborhoods/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    setSaving(null);
    loadNeighborhoods();
  }

  /* ===============================
     ❌ DELETE
  =============================== */
  async function removeNeighborhood(id: string) {
    if (!confirm("Deseja remover esse bairro da entrega?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/neighborhoods/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    loadNeighborhoods();
  }

  /* ===============================
     UI
  =============================== */
  if (loading) {
    return <p>Carregando bairros…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Entrega por bairro</h2>

        <button
          onClick={addNeighborhood}
          className="px-3 py-1 border rounded text-sm"
        >
          + Adicionar bairro
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum bairro configurado ainda.
        </p>
      )}

      <div className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className="flex items-center gap-3 border rounded p-3"
          >
            {/* BAIRRO */}
            <div className="flex flex-col">
              <label className="text-xs">Bairro</label>
              <input
                type="text"
                defaultValue={n.neighborhood}
                className="border rounded px-2 py-1 w-40"
                onBlur={(e) =>
                  updateNeighborhood(n.id, {
                    neighborhood: e.target.value,
                  })
                }
              />
            </div>

            {/* CIDADE */}
            <div className="flex flex-col">
              <label className="text-xs">Cidade</label>
              <input
                type="text"
                defaultValue={n.city}
                className="border rounded px-2 py-1 w-36"
                onBlur={(e) =>
                  updateNeighborhood(n.id, { city: e.target.value })
                }
              />
            </div>

            {/* TAXA */}
            <div className="flex flex-col">
              <label className="text-xs">Taxa (R$)</label>
              <input
                type="number"
                step="0.5"
                defaultValue={n.fee}
                className="border rounded px-2 py-1 w-24"
                onBlur={(e) =>
                  updateNeighborhood(n.id, {
                    fee: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* ETA */}
            <div className="flex flex-col">
              <label className="text-xs">Tempo</label>
              <input
                type="text"
                defaultValue={n.eta}
                className="border rounded px-2 py-1 w-32"
                onBlur={(e) =>
                  updateNeighborhood(n.id, { eta: e.target.value })
                }
              />
            </div>

            {/* ACTIVE */}
            <label className="flex items-center gap-2 ml-2">
              <input
                type="checkbox"
                defaultChecked={n.active}
                onChange={(e) =>
                  updateNeighborhood(n.id, { active: e.target.checked })
                }
              />
              <span className="text-sm">Ativo</span>
            </label>

            {/* DELETE */}
            <button
              onClick={() => removeNeighborhood(n.id)}
              className="ml-auto text-red-500 text-sm"
              disabled={saving === n.id}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
