"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const STORE_SUBDOMAIN = process.env.NEXT_PUBLIC_STORE_SUBDOMAIN;

export default function EntregaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    deliveryFee: 0,
    minOrderValue: 0,
    estimatedTime: "30-45 min",
  });

  // =====================================================
  // 🔹 LOAD SETTINGS (rota pública — mesma do cardápio)
  // =====================================================
  useEffect(() => {
    async function loadSettings() {
      try {
        if (!BACKEND_URL || !STORE_SUBDOMAIN) return;

        const res = await fetch(
          `${BACKEND_URL}/store/${STORE_SUBDOMAIN}/settings`
        );

        const data = await res.json();

        if (data?.settings) {
          setForm({
            deliveryFee: data.settings.deliveryFee ?? 0,
            minOrderValue: data.settings.minOrderValue ?? 0,
            estimatedTime: data.settings.estimatedTime || "30-45 min",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar entrega:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // =====================================================
  // 🔹 SAVE SETTINGS (rota admin)
  // =====================================================
  async function handleSave() {
    try {
      if (!BACKEND_URL || !STORE_ID) {
        alert("Configuração inválida");
        return;
      }

      setSaving(true);

      const res = await fetch(
        `${BACKEND_URL}/store/${STORE_ID}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao salvar");
      }

      alert("Configurações de entrega salvas ✅");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações de entrega");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando configurações de entrega...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configurações de Entrega
      </h1>

      <div className="space-y-4">
        {/* TEMPO ESTIMADO */}
        <div>
          <label className="block text-sm font-medium">
            Tempo estimado de entrega
          </label>
          <input
            type="text"
            value={form.estimatedTime}
            onChange={(e) =>
              setForm({
                ...form,
                estimatedTime: e.target.value,
              })
            }
            className="border rounded px-3 py-2 w-full"
            placeholder="Ex: 30-45 min"
          />
          <p className="text-xs text-gray-500 mt-1">
            Esse tempo será exibido no cardápio público
          </p>
        </div>

        {/* TAXA DE ENTREGA */}
        <div>
          <label className="block text-sm font-medium">
            Taxa de entrega (R$)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={form.deliveryFee}
            onChange={(e) =>
              setForm({
                ...form,
                deliveryFee: Number(e.target.value),
              })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {/* PEDIDO MÍNIMO */}
        <div>
          <label className="block text-sm font-medium">
            Pedido mínimo (R$)
          </label>
          <input
            type="number"
            min={0}
            step="1"
            value={form.minOrderValue}
            onChange={(e) =>
              setForm({
                ...form,
                minOrderValue: Number(e.target.value),
              })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white rounded px-4 py-2 mt-4 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
