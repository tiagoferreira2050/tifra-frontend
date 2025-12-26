"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const STORE_SUBDOMAIN = process.env.NEXT_PUBLIC_STORE_SUBDOMAIN;

export default function StorePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===============================
  // STORE (identidade)
  // ===============================
  const [store, setStore] = useState({
    name: "",
    description: "",
    logoUrl: "",
    coverImage: "",
    address: "",
  });

  // ===============================
  // SETTINGS (dados públicos)
  // ===============================
  const [settings, setSettings] = useState({
    minOrderValue: 0,
    whatsapp: "",
  });

  // ===============================
  // LOAD DATA
  // ===============================
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
            address: data.store.address || "",
          });
        }

        if (data?.settings) {
          setSettings({
            minOrderValue: data.settings.minOrderValue || 0,
            whatsapp: data.settings.whatsapp || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados da loja", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ===============================
  // SAVE
  // ===============================
  async function handleSave() {
    try {
      if (!BACKEND_URL || !STORE_ID) {
        alert("Configuração inválida");
        return;
      }

      setSaving(true);

      // 🔹 Atualiza Store
      await fetch(`${BACKEND_URL}/stores/${STORE_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });

      // 🔹 Atualiza StoreSettings
      await fetch(`${BACKEND_URL}/store/${STORE_ID}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      alert("Minha loja salva com sucesso ✅");
    } catch (error) {
      console.error(error);
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
          Descrição da loja
        </label>
        <textarea
          value={store.description}
          onChange={(e) =>
            setStore({
              ...store,
              description: e.target.value,
            })
          }
          maxLength={400}
          className="border rounded px-3 py-2 w-full"
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Máx. 400 caracteres
        </p>
      </div>

      {/* LOGO */}
      <div>
        <label className="block font-medium mb-1">
          Logo da loja (URL)
        </label>
        <input
          value={store.logoUrl}
          onChange={(e) =>
            setStore({
              ...store,
              logoUrl: e.target.value,
            })
          }
          className="border rounded px-3 py-2 w-full"
          placeholder="https://..."
        />
      </div>

      {/* CAPA */}
      <div>
        <label className="block font-medium mb-1">
          Imagem de capa (URL)
        </label>
        <input
          value={store.coverImage}
          onChange={(e) =>
            setStore({
              ...store,
              coverImage: e.target.value,
            })
          }
          className="border rounded px-3 py-2 w-full"
          placeholder="https://..."
        />
      </div>

      {/* ENDEREÇO */}
      <div>
        <label className="block font-medium mb-1">
          Endereço completo
        </label>
        <textarea
          value={store.address}
          onChange={(e) =>
            setStore({
              ...store,
              address: e.target.value,
            })
          }
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />
      </div>

      {/* WHATSAPP */}
      <div>
        <label className="block font-medium mb-1">
          WhatsApp
        </label>
        <input
          value={settings.whatsapp}
          onChange={(e) =>
            setSettings({
              ...settings,
              whatsapp: e.target.value,
            })
          }
          className="border rounded px-3 py-2 w-full"
          placeholder="DDD + número"
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
