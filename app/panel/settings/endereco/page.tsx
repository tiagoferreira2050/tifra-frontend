"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const STORE_SUBDOMAIN = process.env.NEXT_PUBLIC_STORE_SUBDOMAIN;

export default function EnderecoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState({
    cep: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
  });

  // ===============================
  // LOAD
  // ===============================
  useEffect(() => {
    async function load() {
      try {
        if (!BACKEND_URL || !STORE_SUBDOMAIN) return;

        const res = await fetch(
          `${BACKEND_URL}/store/${STORE_SUBDOMAIN}/settings`
        );
        const data = await res.json();

        if (data?.store?.address) {
          setAddress({
            ...address,
            ...data.store.address,
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

  // ===============================
  // SAVE
  // ===============================
  async function handleSave() {
    try {
      if (!BACKEND_URL || !STORE_ID) return;

      setSaving(true);

      await fetch(`${BACKEND_URL}/stores/${STORE_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
        }),
      });

      alert("Endereço salvo com sucesso ✅");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar endereço");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando endereço...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Endereço</h1>

      {/* CEP */}
      <div>
        <label className="font-medium">CEP*</label>
        <input
          value={address.cep}
          onChange={(e) =>
            setAddress({ ...address, cep: e.target.value })
          }
          className="border rounded px-3 py-2 w-full"
          placeholder="00000-000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ESTADO */}
        <div>
          <label className="font-medium">Estado*</label>
          <input
            value={address.state}
            onChange={(e) =>
              setAddress({ ...address, state: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {/* CIDADE */}
        <div>
          <label className="font-medium">Cidade*</label>
          <input
            value={address.city}
            onChange={(e) =>
              setAddress({ ...address, city: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* BAIRRO */}
      <div>
        <label className="font-medium">Bairro*</label>
        <input
          value={address.neighborhood}
          onChange={(e) =>
            setAddress({
              ...address,
              neighborhood: e.target.value,
            })
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* RUA */}
      <div>
        <label className="font-medium">Endereço*</label>
        <input
          value={address.street}
          onChange={(e) =>
            setAddress({ ...address, street: e.target.value })
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NUMERO */}
        <div>
          <label className="font-medium">Número*</label>
          <input
            value={address.number}
            onChange={(e) =>
              setAddress({ ...address, number: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {/* COMPLEMENTO */}
        <div>
          <label className="font-medium">Complemento</label>
          <input
            value={address.complement}
            onChange={(e) =>
              setAddress({
                ...address,
                complement: e.target.value,
              })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>
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
