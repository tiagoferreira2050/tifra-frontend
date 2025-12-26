"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

/* ===============================
   HELPERS
=============================== */
function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14);
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

/**
 * 🔹 UPLOAD DE IMAGEM
 * Agora: preview local
 * Depois: Cloudinary
 */
async function uploadImage(file: File): Promise<string> {
  // futuramente: enviar pro backend / Cloudinary
  return URL.createObjectURL(file);
}

export default function StorePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  /* ===============================
     STATE
  =============================== */
  const [store, setStore] = useState({
    name: "",
    description: "",
    logoUrl: null as string | null,
    coverImage: null as string | null,
  });

  const [settings, setSettings] = useState({
    whatsapp: "",
    minOrderValue: 0,
  });

  /* ===============================
     LOAD DATA (PADRÃO DOMÍNIO)
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        // 🔹 STORE
        const storeData = await apiFetch("/api/store/me");
        setStoreId(storeData.id);

        setStore({
          name: storeData.name ?? "",
          description: storeData.description ?? "",
          logoUrl: storeData.logoUrl ?? null,
          coverImage: storeData.coverImage ?? null,
        });

        // 🔹 STORE SETTINGS
        const data = await apiFetch("/api/store/settings");

setStoreId(data.store.id);

setStore({
  name: data.store.name ?? "",
  description: data.store.description ?? "",
  logoUrl: data.store.logoUrl ?? null,
  coverImage: data.store.coverImage ?? null,
});

setSettings({
  whatsapp: data.settings.whatsapp ?? "",
  minOrderValue: data.settings.minOrderValue ?? 0,
});

      } catch (err) {
        console.error("Erro ao carregar dados da loja:", err);
        alert("Erro ao carregar dados da loja");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ===============================
     SAVE
  =============================== */
  async function handleSave() {
    if (!storeId || saving) return;

    if (!settings.whatsapp) {
      alert("WhatsApp é obrigatório");
      return;
    }

    try {
      setSaving(true);

      // 🔹 STORE
      await apiFetch(`/api/store/${storeId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: store.name.trim(),
          description: store.description.trim(),
          logoUrl: store.logoUrl,
          coverImage: store.coverImage,
        }),
      });

      // 🔹 STORE SETTINGS (UPSERT)
      await apiFetch(`/api/store/${storeId}/settings`, {
        method: "PUT",
        body: JSON.stringify({
          whatsapp: settings.whatsapp,
          minOrderValue: settings.minOrderValue,
        }),
      });

      alert("Dados da loja salvos com sucesso ✅");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar dados da loja");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando dados da loja...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Minha loja</h1>

      {/* CAPA */}
      <div>
        <label className="block font-medium mb-2">Imagem de capa</label>

        <div className="relative w-full h-44 rounded-xl overflow-hidden border">
          {store.coverImage ? (
            <img
              src={store.coverImage}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Capa da loja
            </div>
          )}

          <label className="absolute top-2 right-2 bg-white rounded-full p-2 shadow cursor-pointer">
            ✏️
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadImage(file);
                  setStore((s) => ({ ...s, coverImage: url }));
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* LOGO */}
      <div>
        <label className="block font-medium mb-2">Logo da loja</label>

        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border flex items-center justify-center text-gray-400">
              Logo
            </div>
          )}

          <label className="cursor-pointer text-blue-600 text-sm">
            Alterar logo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadImage(file);
                  setStore((s) => ({ ...s, logoUrl: url }));
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* NOME */}
      <div>
        <label className="block font-medium mb-1">Nome da loja</label>
        <input
          value={store.name}
          onChange={(e) =>
            setStore({ ...store, name: e.target.value })
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* DESCRIÇÃO */}
      <div>
        <label className="block font-medium mb-1">Descrição</label>
        <textarea
          value={store.description}
          onChange={(e) =>
            setStore({ ...store, description: e.target.value })
          }
          maxLength={400}
          rows={4}
          className="border rounded px-3 py-2 w-full"
        />
        <p className="text-xs text-gray-500">Máximo 400 caracteres</p>
      </div>

      {/* WHATSAPP */}
      <div>
        <label className="block font-medium mb-1">
          WhatsApp da loja
        </label>
        <input
          value={settings.whatsapp}
          onChange={(e) =>
            setSettings({
              ...settings,
              whatsapp: formatPhone(e.target.value),
            })
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* PEDIDO MÍNIMO */}
      <div>
        <label className="block font-medium mb-1">
          Pedido mínimo (R$)
        </label>
        <input
          type="number"
          min={0}
          value={settings.minOrderValue}
          onChange={(e) =>
            setSettings({
              ...settings,
              minOrderValue: Number(e.target.value),
            })
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
