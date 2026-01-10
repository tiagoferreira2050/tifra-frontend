"use client";

import { useEffect, useState } from "react";
import { Navigation, Save, Map, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function EnderecoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const [address, setAddress] = useState({
    cep: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
    reference: "",
  });

  /* ===============================
     LOAD — STOREADDRESS
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        if (!BACKEND_URL || !STORE_ID) return;

        const res = await fetch(
          `${BACKEND_URL}/api/store-address/${STORE_ID}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data) {
          setAddress((prev) => ({
            ...prev,
            cep: data.cep || "",
            street: data.street || "",
            number: data.number || "",
            neighborhood: data.neighborhood || "",
            city: data.city || "",
            state: data.state || "",
            complement: data.complement || "",
            reference: data.reference || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar endereço:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ===============================
     CEP AUTO SEARCH
  =============================== */
  async function handleCepChange(value: string) {
    const cleanCep = value.replace(/\D/g, "").slice(0, 8);
    const formattedCep = cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2");

    setAddress((prev) => ({ ...prev, cep: formattedCep }));

    if (cleanCep.length !== 8) return;

    try {
      setLoadingCep(true);

      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) return;

      setAddress((prev) => ({
        ...prev,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));
    } catch {
      console.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  }

  /* ===============================
     GEO (OPCIONAL)
  =============================== */
  async function getLatLngFromAddress() {
    if (!GOOGLE_MAPS_KEY) return null;

    const cepClean = address.cep.replace(/\D/g, "");

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${cepClean}|country:BR&key=${GOOGLE_MAPS_KEY}`
      );

      const data = await res.json();

      if (data.status === "OK" && data.results?.length) {
        return data.results[0].geometry.location;
      }
    } catch {
      return null;
    }

    return null;
  }

  /* ===============================
     SAVE — STOREADDRESS
  =============================== */
  async function handleSave() {
    try {
      if (!BACKEND_URL || !STORE_ID) return;

      setSaving(true);

      let lat = null;
      let lng = null;

      const geo = await getLatLngFromAddress();
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }

      const res = await fetch(
        `${BACKEND_URL}/api/store-address/${STORE_ID}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...address,
            lat,
            lng,
          }),
        }
      );

      if (!res.ok) throw new Error("Erro ao salvar");

      alert("Endereço salvo com sucesso ✅");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar endereço");
    } finally {
      setSaving(false);
    }
  }

  /* ===============================
     MAPA (SOMENTE VISUAL)
  =============================== */
  const addressForMap =
    address.street && address.city
      ? `${address.street} ${address.number || ""}, ${address.city} - ${address.state}, Brasil`
      : address.cep
      ? `${address.cep}, Brasil`
      : "";

  const mapUrl =
    GOOGLE_MAPS_KEY && addressForMap
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(
          addressForMap
        )}`
      : null;

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 grid grid-cols-3 items-center">
          <button onClick={() => history.back()}>
            <ArrowLeft />
          </button>

          <h1 className="text-center text-xl font-bold">
            Endereço da Loja
          </h1>

          <button
            onClick={handleSave}
            disabled={saving}
            className="justify-self-end flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md"
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <input
          placeholder="CEP"
          value={address.cep}
          onChange={(e) => handleCepChange(e.target.value)}
          className="w-full h-11 border rounded px-4"
        />

        <input
          placeholder="Rua"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          className="w-full h-11 border rounded px-4"
        />

        <input
          placeholder="Número"
          value={address.number}
          onChange={(e) => setAddress({ ...address, number: e.target.value })}
          className="w-full h-11 border rounded px-4"
        />

        <input
          placeholder="Bairro"
          value={address.neighborhood}
          onChange={(e) =>
            setAddress({ ...address, neighborhood: e.target.value })
          }
          className="w-full h-11 border rounded px-4"
        />

        <input
          placeholder="Cidade"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          className="w-full h-11 border rounded px-4"
        />

        <input
          placeholder="UF"
          value={address.state}
          onChange={(e) =>
            setAddress({ ...address, state: e.target.value.toUpperCase() })
          }
          className="w-full h-11 border rounded px-4"
        />

        {/* MAPA */}
        {mapUrl && (
          <iframe
            src={mapUrl}
            className="w-full h-48 rounded border"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
