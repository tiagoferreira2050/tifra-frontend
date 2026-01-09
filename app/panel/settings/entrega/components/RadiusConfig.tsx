"use client";

import { useEffect, useState } from "react";

type Radius = {
  id: string;
  maxKm: number;
  fee: number;
  eta: string;
  active: boolean;
};

export default function RadiusConfig() {
  const [radii, setRadii] = useState<Radius[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  /* ===============================
     🔄 LOAD
  =============================== */
  async function loadRadii() {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/radius`,
      { credentials: "include" }
    );
    const data = await res.json();
    setRadii(data);
    setLoading(false);
  }

  useEffect(() => {
    loadRadii();
  }, []);

  /* ===============================
     ➕ ADD
  =============================== */
  async function addRadius() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/radius`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          maxKm: 1,
          fee: 0,
          eta: "30-40 min",
          active: true,
        }),
      }
    );

    if (res.ok) loadRadii();
  }

  /* ===============================
     💾 UPDATE
  =============================== */
  async function updateRadius(id: string, payload: Partial<Radius>) {
    setSaving(id);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/radius/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    setSaving(null);
    loadRadii();
  }

  /* ===============================
     ❌ DELETE
  =============================== */
  async function removeRadius(id: string) {
    if (!confirm("Deseja remover essa faixa de entrega?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/radius/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    loadRadii();
  }

  /* ===============================
     UI
  =============================== */
  if (loading) {
    return <p>Carregando faixas de entrega…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Entrega por raio (km)</h2>

        <button
          onClick={addRadius}
          className="px-3 py-1 border rounded text-sm"
        >
          + Nova faixa
        </button>
      </div>

      {radii.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhuma faixa cadastrada ainda.
        </p>
      )}

      <div className="space-y-3">
        {radii.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 border rounded p-3"
          >
            {/* KM */}
            <div className="flex flex-col">
              <label className="text-xs">Até (km)</label>
              <input
                type="number"
                defaultValue={r.maxKm}
                className="border rounded px-2 py-1 w-20"
                onBlur={(e) =>
                  updateRadius(r.id, { maxKm: Number(e.target.value) })
                }
              />
            </div>

            {/* FEE */}
            <div className="flex flex-col">
              <label className="text-xs">Taxa (R$)</label>
              <input
                type="number"
                step="0.5"
                defaultValue={r.fee}
                className="border rounded px-2 py-1 w-24"
                onBlur={(e) =>
                  updateRadius(r.id, { fee: Number(e.target.value) })
                }
              />
            </div>

            {/* ETA */}
            <div className="flex flex-col">
              <label className="text-xs">Tempo</label>
              <input
                type="text"
                defaultValue={r.eta}
                className="border rounded px-2 py-1 w-32"
                onBlur={(e) => updateRadius(r.id, { eta: e.target.value })}
              />
            </div>

            {/* ACTIVE */}
            <label className="flex items-center gap-2 ml-2">
              <input
                type="checkbox"
                defaultChecked={r.active}
                onChange={(e) =>
                  updateRadius(r.id, { active: e.target.checked })
                }
              />
              <span className="text-sm">Ativo</span>
            </label>

            {/* DELETE */}
            <button
              onClick={() => removeRadius(r.id)}
              className="ml-auto text-red-500 text-sm"
              disabled={saving === r.id}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
