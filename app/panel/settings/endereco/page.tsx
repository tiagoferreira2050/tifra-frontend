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

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// 🔥 DEBUG TEMPORÁRIO
// 👉 COLE AQUI O storeId DO BANCO
const DEBUG_STORE_ID = "COLE_AQUI_O_STORE_ID";

export default function StoreAddressPage() {
  const [storeId] = useState<string>(DEBUG_STORE_ID);
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
     📄 BUSCAR ENDEREÇO DA LOJA (DIRETO DO BANCO)
     GET /api/store-address/:storeId
  =================================================== */
  useEffect(() => {
    async function loadAddress() {
      try {
        const res = await fetch(
          `${API_URL}/api/store-address/${DEBUG_STORE_ID}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("Erro ao buscar endereço");
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
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ===================================================
     💾 SALVAR (UPDATE VIA UPSERT)
  =================================================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("SUBMIT DEBUG", { storeId, form });

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/store-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeId: DEBUG_STORE_ID,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro backend:", data);
        alert("Erro ao salvar endereço");
        return;
      }

      alert("Endereço atualizado com sucesso ✅");
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
      <h1>Endereço da Loja (DEBUG)</h1>

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
