"use client";

import { useEffect, useState } from "react";

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
     🔁 BUSCAR STORE (PADRÃO DO SEU BACKEND)
     👉 usa /api/store (já existente)
  =================================================== */
  useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/store`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setLoaded(true);
          return;
        }

        const data = await res.json();

        // ⚠️ ajuste se o formato for outro
        setStoreId(data.id);
      } catch {
        setLoaded(true);
      }
    }

    loadStore();
  }, []);

  /* ===================================================
     📄 BUSCAR ENDEREÇO DA LOJA
  =================================================== */
  useEffect(() => {
    if (!storeId) return;

    async function loadAddress() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/store-address/${storeId}`,
          { credentials: "include" }
        );

        if (res.ok) {
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
        }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/store-address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ storeId, ...form }),
        }
      );

      if (!res.ok) {
        alert("Erro ao salvar endereço");
        return;
      }

      alert("Endereço salvo com sucesso ✅");
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
