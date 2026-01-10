"use client";

import { useEffect, useState } from "react";
import { Navigation, Save, Map, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
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
        if (!BACKEND_URL) return;

        const res = await fetch(`${BACKEND_URL}/api/store-address/address`, {
  credentials: "include",

        });

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
        console.error("Erro ao carregar endereço da loja:", err);
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
      if (!BACKEND_URL) return;

      setSaving(true);

      let lat = null;
      let lng = null;

      const geo = await getLatLngFromAddress();
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }

      const res = await fetch(`${BACKEND_URL}/api/store/address`, {
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
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar endereço");
      }

      alert("Endereço salvo com sucesso ✅");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar endereço");
    } finally {
      setSaving(false);
    }
  }

  /* ===============================
     GOOGLE MAP
  =============================== */
  const fullAddress =
    address.street && address.city
      ? `${address.street} ${address.number || ""}, ${address.neighborhood || ""}, ${address.city} - ${address.state}, Brasil`
      : "";

  const fallbackAddress =
    address.cep && address.cep.replace(/\D/g, "").length === 8
      ? `${address.cep}, Brasil`
      : "";

  const addressForMap = fullAddress || fallbackAddress;

  const mapUrl =
    GOOGLE_MAPS_KEY && addressForMap
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(
          addressForMap
        )}`
      : null;

  /* ===============================
     RENDER
  =============================== */
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
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 grid grid-cols-3 items-center">
          <button
            onClick={() => window.history.back()}
            className="h-9 w-9 rounded-md flex items-center justify-center
                       text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-center text-xl sm:text-2xl font-bold">
            Endereço da Loja
          </h1>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900
                         px-4 py-2 text-sm font-medium text-white
                         hover:bg-gray-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* CEP */}
        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Navigation className="h-5 w-5 text-blue-600" />
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
            placeholder="00000-000"
            value={address.cep}
            onChange={(e) => handleCepChange(e.target.value)}
            className="h-11 w-full rounded-lg border px-4 text-sm"
          />
        </div>

        {/* CAMPOS */}
        <div className="rounded-xl border p-6 space-y-4">
          <input
            placeholder="Rua / Avenida"
            value={address.street}
            onChange={(e) =>
              setAddress({ ...address, street: e.target.value })
            }
            className="h-11 w-full rounded-lg border px-4 text-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Número"
              value={address.number}
              onChange={(e) =>
                setAddress({ ...address, number: e.target.value })
              }
              className="h-11 w-full rounded-lg border px-4 text-sm"
            />

            <input
              placeholder="Complemento"
              value={address.complement}
              onChange={(e) =>
                setAddress({ ...address, complement: e.target.value })
              }
              className="h-11 w-full rounded-lg border px-4 text-sm"
            />
          </div>

          <input
            placeholder="Bairro"
            value={address.neighborhood}
            onChange={(e) =>
              setAddress({ ...address, neighborhood: e.target.value })
            }
            className="h-11 w-full rounded-lg border px-4 text-sm"
          />

          <div className="grid grid-cols-3 gap-4">
            <input
              className="col-span-2 h-11 w-full rounded-lg border px-4 text-sm"
              placeholder="Cidade"
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
            />

            <input
              placeholder="UF"
              value={address.state}
              onChange={(e) =>
                setAddress({
                  ...address,
                  state: e.target.value.toUpperCase().slice(0, 2),
                })
              }
              className="h-11 w-full rounded-lg border px-4 text-sm"
            />
          </div>

          <input
            placeholder="Ponto de referência"
            value={address.reference}
            onChange={(e) =>
              setAddress({ ...address, reference: e.target.value })
            }
            className="h-11 w-full rounded-lg border px-4 text-sm"
          />
        </div>

        {/* MAP */}
        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Map className="h-5 w-5 text-amber-600" />
            <p className="font-semibold">Visualização no Mapa</p>
          </div>

          {mapUrl ? (
            <iframe
              src={mapUrl}
              className="w-full h-48 rounded-lg border"
              loading="lazy"
            />
          ) : (
            <div className="h-48 border border-dashed rounded-lg flex items-center justify-center text-sm text-gray-400">
              Preencha o endereço para visualizar no mapa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
