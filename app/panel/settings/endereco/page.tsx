"use client";

import { useEffect, useState } from "react";

type Store = {
  id: string;
  name: string;
};

type StoreAddress = {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  reference?: string;
  lat?: number;
  lng?: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function StoreAddressPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState<StoreAddress>({
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
    reference: "",
  });

  /* ===================================================
     1️⃣ BUSCAR LOJAS DO USUÁRIO
     GET /api/stores
  =================================================== */
  useEffect(() => {
    async function loadStores() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/stores`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Erro ao buscar stores");
          setLoaded(true);
          return;
        }

        const stores: Store[] = await res.json();

        if (!Array.isArray(stores) || stores.length === 0) {
          alert("Nenhuma loja encontrada para este usuário");
          setLoaded(true);
          return;
        }

        // 👉 por enquanto usa a primeira loja
        setStoreId(stores[0].id);
      } catch (err) {
        console.error("Erro loadStores:", err);
        setLoaded(true);
      }
    }

    loadStores();
  }, []);

  /* ===================================================
     2️⃣ BUSCAR ENDEREÇO DA LOJA
     GET /api/store-address/:storeId
  =================================================== */
  useEffect(() => {
    if (!storeId) return;

    async function loadAddress() {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/store-address/${storeId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.warn("Endereço ainda não cadastrado");
          setLoaded(true);
          return;
        }

        const data = await res.json();

        if (data) {
          setForm({
            cep: data.cep || "",
            street: data.street || "",
            number: data.number || "",
            neighborhood: data.neighborhood || "",
            city: data.city || "",
            state: data.state || "",
            complement: data.complement || "",
            reference: data.reference || "",
            lat: data.lat,
            lng: data.lng,
          });
        }
      } catch (err) {
        console.error("Erro loadAddress:", err);
      } finally {
        setLoaded(true);
      }
    }

    loadAddress();
  }, [storeId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ===================================================
     3️⃣ SALVAR ENDEREÇO (UPSERT)
     POST /api/store-address
  =================================================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!storeId) {
      alert("Loja não carregada");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/store-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeId,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro backend:", data);
        alert("Erro ao salvar endereço");
        return;
      }

      alert("Endereço salvo com sucesso ✅");
    } catch (err) {
      console.error("Erro submit:", err);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return <p>Carregando endereço...</p>;
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Endereço da Loja</h1>

      <form onSubmit={handleSubmit}>
        <input name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} />
        <input name="street" placeholder="Rua" value={form.street} onChange={handleChange} />
        <input name="number" placeholder="Número" value={form.number} onChange={handleChange} />
        <input
          name="neighborhood"
          placeholder="Bairro"
          value={form.neighborhood}
          onChange={handleChange}
        />
        <input name="city" placeholder="Cidade" value={form.city} onChange={handleChange} />
        <input name="state" placeholder="Estado" value={form.state} onChange={handleChange} />
        <input
          name="complement"
          placeholder="Complemento"
          value={form.complement}
          onChange={handleChange}
        />
        <input
          name="reference"
          placeholder="Referência"
          value={form.reference}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar endereço"}
        </button>
      </form>
    </div>
  );
}
