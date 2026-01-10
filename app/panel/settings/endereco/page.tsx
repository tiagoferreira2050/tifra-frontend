"use client";

import { useEffect, useState } from "react";
import { Navigation, Save, Map, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type StoreAddress = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  reference: string;
};

export default function EnderecoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const [address, setAddress] = useState<StoreAddress>({
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
     LOAD — STORE ADDRESS
  =============================== */
  useEffect(() => {
    async function loadAddress() {
      try {
        if (!BACKEND_URL || !STORE_ID) return;

        const res = await fetch(
          `${BACKEND_URL}/api/store-address/${STORE_ID}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data) {
          setAddress({
            cep: data.cep || "",
            state: data.state || "",
            city: data.city || "",
            neighborhood: data.neighborhood || "",
            street: data.street || "",
            number: data.number || "",
            complement: data.complement || "",
            reference: data.reference || "",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar endereço:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAddress();
  }, []);

  /* ===============================
     CEP AUTO SEARCH
  =============================== */
  async function handleCepChange(value: string) {
    const cleanCep = value.replace(/\D/g, "").slice(0, 8);
    const formattedCep =
      cleanCep.length === 8
        ? cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2")
        : cleanCep;

    setAddress((prev) => ({ ...prev, cep: formattedCep }));

    if (cleanCep.length !== 8) return;

    try {
      setLoadingCep(true);

      const res = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await res.json();

      if (data?.erro) return;

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
     GEOLOCATION (OPTIONAL)
  =============================== */
  async function getLatLngFromAddress() {
    if (!GOOGLE_MAPS_KEY) return null;

    const cepClean = address.cep.replace(/\D/g, "");

    if (cepClean.length === 8) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${cepClean}|country:BR&key=${GOOGLE_MAPS_KEY}`
        );
        const data = await res.json();

        if (data.status === "OK" && data.results?.length) {
          return data.results[0].geometry.location;
        }
      } catch {}
    }

    if (!address.street || !address.city || !address.state) return null;

    const fullAddress = `${address.street} ${address.number || ""}, ${address.city} - ${address.state}, Brasil`;

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress
        )}&key=${GOOGLE_MAPS_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results?.length) {
        return data.results[0].geometry.location;
      }
    } catch {}

    return null;
  }

  /* ===============================
     SAVE — STORE ADDRESS
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...address, lat, lng }),
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
     MAP
  =============================== */
  const fullAddress =
    address.street && address.city
      ? `${address.street} ${address.number || ""}, ${address.neighborhood || ""}, ${address.city} - ${address.state}, Brasil`
      : "";

  const fallbackAddress =
    address.cep && address.cep.replace(/\D/g, "").length === 8
      ? `${address.cep}, Brasil`
      : "";

  const mapUrl =
    GOOGLE_MAPS_KEY && (fullAddress || fallbackAddress)
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(
          fullAddress || fallbackAddress
        )}`
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando endereço...
      </div>
    );
  }

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

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md"
            >
              <Save size={16} />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <input
          placeholder="CEP"
          value={address.cep}
          onChange={(e) => handleCepChange(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          placeholder="Rua"
          value={address.street}
          onChange={(e) =>
            setAddress({ ...address, street: e.target.value })
          }
          className="w-full border p-3 rounded"
        />

        <input
          placeholder="Número"
          value={address.number}
          onChange={(e) =>
            setAddress({ ...address, number: e.target.value })
          }
          className="w-full border p-3 rounded"
        />

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
