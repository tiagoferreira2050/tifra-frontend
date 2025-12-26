"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const STORE_SUBDOMAIN = process.env.NEXT_PUBLIC_STORE_SUBDOMAIN;

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    isOpen: true,
    openTime: "13:00",
    closeTime: "22:00",
    deliveryFee: 0,
    minOrderValue: 0,
    estimatedTime: "30-45 min",
    whatsapp: "",
  });

  // =====================================================
  // 🔹 LOAD SETTINGS (rota pública)
  // =====================================================
  useEffect(() => {
    async function loadSettings() {
      try {
        if (!STORE_SUBDOMAIN || !BACKEND_URL) return;

        const res = await fetch(
          `${BACKEND_URL}/store/${STORE_SUBDOMAIN}/settings`
        );

        const data = await res.json();

        if (data?.settings) {
          setForm({
            isOpen: data.settings.isOpen,
            openTime: data.settings.openTime,
            closeTime: data.settings.closeTime,
            deliveryFee: data.settings.deliveryFee,
            minOrderValue: data.settings.minOrderValue,
            estimatedTime: data.settings.estimatedTime,
            whatsapp: data.settings.whatsapp || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
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
      if (!STORE_ID || !BACKEND_URL) {
        alert("STORE_ID ou BACKEND_URL não configurado");
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

      alert("Configurações salvas com sucesso ✅");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando configurações...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configurações da Loja
      </h1>

      <div className="space-y-4">
        {/* STATUS */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isOpen}
            onChange={(e) =>
              setForm({ ...form, isOpen: e.target.checked })
            }
          />
          <span>Loja aberta</span>
        </label>

        {/* HORÁRIOS */}
        <div>
          <label className="block text-sm font-medium">
            Horário de abertura
          </label>
          <input
            type="time"
            value={form.openTime}
            onChange={(e) =>
              setForm({ ...form, openTime: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Horário de fechamento
          </label>
          <input
            type="time"
            value={form.closeTime}
            onChange={(e) =>
              setForm({ ...form, closeTime: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {/* TAXA */}
        <div>
          <label className="block text-sm font-medium">
            Taxa de entrega
          </label>
          <input
            type="number"
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
            Pedido mínimo
          </label>
          <input
            type="number"
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

        {/* TEMPO */}
        <div>
          <label className="block text-sm font-medium">
            Tempo estimado
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
          />
        </div>

        {/* WHATSAPP */}
        <div>
          <label className="block text-sm font-medium">
            WhatsApp
          </label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) =>
              setForm({ ...form, whatsapp: e.target.value })
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


