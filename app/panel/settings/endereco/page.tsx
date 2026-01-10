"use client";

import { useEffect, useState } from "react";
import { Navigation, Save, Map, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type AddressState = {
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

  const [address, setAddress] = useState<AddressState>({
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
     LOAD — StoreAddress
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        if (!BACKEND_URL || !STORE_ID) return;

        const res = await fetch(
          `${BACKEND_URL}/api/store-address/${STORE_ID}`,
          {
            credentials: "include",
          }
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
        console.error("Erro ao carregar endereço da loja", err);
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
    const formattedCep =
      cleanCep.length === 8
        ? cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2")
        : value;

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
     GEOLOCALIZAÇÃO
  =============================== */
  async function getLatLng() {
    if (!GOOGLE_MAPS_KEY) return null;

    const fullAddress = `${address.street} ${address.number}, ${address.city} - ${address.state}, Brasil`;

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
    } catch {
      return null;
    }

    return null;
  }

  /* ===============================
     SAVE — StoreAddress
  =============================== */
  async function handleSave() {
    try {
      if (!BACKEND_URL || !STORE_ID) return;

      setSaving(true);

      let lat = null;
      let lng = null;

      const geo = await getLatLng();
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

      if (!res.ok) {
        throw new Error("Erro ao salvar endereço");
      }

      alert("Endereço da loja salvo com sucesso ✅");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar endereço");
    } finally {
      setSaving(false);
    }
  }

  /* ===============================
     MAPA
  =============================== */
  const addressForMap =
    address.street && address.city
      ? `${address.street} ${address.number}, ${address.city} - ${address.state}, Brasil`
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
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-5 grid grid-cols-3 items-center">
          <button
            onClick={() => window.history.back()}
            className="h-9 w-9 rounded-md hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-center text-xl font-bold">Endereço da Loja</h1>

          <button
            onClick={handleSave}
            disabled={saving}
            className="justify-self-end flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* CEP */}
        <div className="border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Navigation className="text-blue-600" />
            <div>
              <p className="font-semibold">Buscar por CEP</p>
              <p className="text-sm text-gray-500">
                {loadingCep
                  ? "Buscando endereço..."
                  : "Digite o CEP para preencher automaticamente"}
              </p>
            </div>
          </div>

          <input
            value={address.cep}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            className="w-full h-11 border rounded-lg px-4"
          />
        </div>

        {/* FORM */}
        <div className="border rounded-xl p-6 space-y-4">
          <input
            value={address.street}
            onChange={(e) =>
              setAddress({ ...address, street: e.target.value })
            }
            placeholder="Rua / Avenida"
            className="w-full h-11 border rounded-lg px-4"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              value={address.number}
              onChange={(e) =>
                setAddress({ ...address, number: e.target.value })
              }
              placeholder="Número"
              className="h-11 border rounded-lg px-4"
            />

            <input
              value={address.complement}
              onChange={(e) =>
                setAddress({ ...address, complement: e.target.value })
              }
              placeholder="Complemento"
              className="h-11 border rounded-lg px-4"
            />
          </div>

          <input
            value={address.neighborhood}
            onChange={(e) =>
              setAddress({ ...address, neighborhood: e.target.value })
            }
            placeholder="Bairro"
            className="w-full h-11 border rounded-lg px-4"
          />

          <div className="grid grid-cols-3 gap-4">
            <input
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
              placeholder="Cidade"
              className="col-span-2 h-11 border rounded-lg px-4"
            />

            <input
              value={address.state}
              onChange={(e) =>
                setAddress({
                  ...address,
                  state: e.target.value.toUpperCase().slice(0, 2),
                })
              }
              placeholder="UF"
              className="h-11 border rounded-lg px-4"
            />
          </div>

          <input
            value={address.reference}
            onChange={(e) =>
              setAddress({ ...address, reference: e.target.value })
            }
            placeholder="Ponto de referência"
            className="w-full h-11 border rounded-lg px-4"
          />
        </div>

        {/* MAPA */}
        <div className="border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Map className="text-amber-600" />
            <p className="font-semibold">Visualização no mapa</p>
          </div>

          {mapUrl ? (
            <iframe
              src={mapUrl}
              className="w-full h-48 rounded-lg border"
              loading="lazy"
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
              Preencha o endereço para visualizar no mapa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
