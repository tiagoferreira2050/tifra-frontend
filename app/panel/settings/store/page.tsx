"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const STORE_SUBDOMAIN = process.env.NEXT_PUBLIC_STORE_SUBDOMAIN;

/* ===============================
   HELPERS
=============================== */
function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 10) {
    // (xx) xxxx-xxxx
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14);
  }

  // (xx) xxxxx-xxxx
  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

function readFile(file: File, callback: (url: string) => void) {
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result as string);
  reader.readAsDataURL(file);
}

export default function StorePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ===============================
     STATE
  =============================== */
  const [store, setStore] = useState({
    name: "",
    description: "",
    logoUrl: "",
    coverImage: "",
  });

  const [settings, setSettings] = useState({
    minOrderValue: 0,
    whatsapp: "",
  });

  /* ===============================
     LOAD DATA
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        if (!BACKEND_URL || !STORE_SUBDOMAIN) return;

        const res = await fetch(
          `${BACKEND_URL}/store/${STORE_SUBDOMAIN}/settings`
        );
        const data = await res.json();

        if (data?.store) {
          setStore({
            name: data.store.name || "",
            description: data.store.description || "",
            logoUrl: data.store.logoUrl || "",
            coverImage: data.store.coverImage || "",
          });
        }

        if (data?.settings) {
          setSettings({
            minOrderValue: data.settings.minOrderValue || 0,
            whatsapp: data.settings.whatsapp || "",
          });
        }
      } catch (err) {
        console.error(err);
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
    try {
      if (!STORE_ID || !BACKEND_URL) return;

      if (!settings.whatsapp) {
        alert("WhatsApp é obrigatório");
        return;
      }

      setSaving(true);

      // 🔹 Store
      await fetch(`${BACKEND_URL}/stores/${STORE_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });

      // 🔹 StoreSettings
      await fetch(`${BACKEND_URL}/store/${STORE_ID}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      alert("Dados da loja salvos com sucesso ✅");
    } catch (err) {
      console.error(err);
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
        <label className="block font-medium mb-2">
          Imagem de capa
        </label>

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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  readFile(file, (url) =>
                    setStore({ ...store, coverImage: url })
                  );
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* LOGO */}
      <div>
        <label className="block font-medium mb-2">
          Logo da loja
        </label>

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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  readFile(file, (url) =>
                    setStore({ ...store, logoUrl: url })
                  );
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* NOME */}
      <div>
        <label className="block font-medium mb-1">
          Nome da loja
        </label>
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
        <label className="block font-medium mb-1">
          Descrição
        </label>
        <textarea
          value={store.description}
          onChange={(e) =>
            setStore({ ...store, description: e.target.value })
          }
          maxLength={400}
          rows={4}
          className="border rounded px-3 py-2 w-full"
        />
        <p className="text-xs text-gray-500">
          Máximo 400 caracteres
        </p>
      </div>

      {/* WHATSAPP */}
      <div>
        <label className="block font-medium mb-1">
          WhatsApp da loja
        </label>
        <input
          value={settings.whatsapp}
          required
          onChange={(e) =>
            setSettings({
              ...settings,
              whatsapp: formatPhone(e.target.value),
            })
          }
          placeholder="(31) 99999-9999"
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
