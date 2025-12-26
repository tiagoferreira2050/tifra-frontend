"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const STORE_SUBDOMAIN = process.env.NEXT_PUBLIC_STORE_SUBDOMAIN;

export default function HorariosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    isOpen: true,
    openTime: "13:00",
    closeTime: "22:00",
  });

  // ===============================
  // 🔹 LOAD SETTINGS
  // ===============================
  useEffect(() => {
    async function load() {
      try {
        if (!BACKEND_URL || !STORE_SUBDOMAIN) return;

        const res = await fetch(
          `${BACKEND_URL}/store/${STORE_SUBDOMAIN}/settings`
        );

        const data = await res.json();

        if (data?.settings) {
          setForm({
            isOpen: data.settings.isOpen,
            openTime: data.settings.openTime,
            closeTime: data.settings.closeTime,
          });
        }
      } catch (err) {
        console.error("Erro ao carregar horários", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ===============================
  // 🔹 SAVE SETTINGS
  // ===============================
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

      alert("Horários salvos com sucesso ✅");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar horários");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando horários...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Horários da Loja
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

        {/* ABERTURA */}
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

        {/* FECHAMENTO */}
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
