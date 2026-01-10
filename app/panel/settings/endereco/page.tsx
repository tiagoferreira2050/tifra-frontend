"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Save, Map } from "lucide-react";

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
    reference: "",
  });

  /* ===============================
     LOAD
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        if (!BACKEND_URL || !STORE_SUBDOMAIN) return;

        const res = await fetch(
          `${BACKEND_URL}/store/${STORE_SUBDOMAIN}/settings`
        );
        const data = await res.json();

        if (data?.store?.address) {
          setAddress((prev) => ({
            ...prev,
            ...data.store.address,
          }));
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
      if (!BACKEND_URL || !STORE_ID) return;

      setSaving(true);

      await fetch(`${BACKEND_URL}/stores/${STORE_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
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
    return (
      <div className="p-6 text-sm text-gray-500">
        Carregando endereço...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* HEADER */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Endereço da Loja
            </h1>
            <p className="text-sm text-gray-500">
              Configure a localização do seu estabelecimento
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* BUSCAR CEP */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Buscar por CEP
              </p>
              <p className="text-sm text-gray-500">
                Digite o CEP para preencher automaticamente
              </p>
            </div>
          </div>

          <input
            placeholder="00000-000"
            value={address.cep}
            onChange={(e) =>
              setAddress({ ...address, cep: e.target.value })
            }
            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {/* DADOS DO ENDEREÇO */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 transition hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Dados do Endereço
              </p>
              <p className="text-sm text-gray-500">
                Preencha as informações de localização
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rua / Avenida *</label>
            <input
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              placeholder="Ex: Avenida Paulista"
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Número *</label>
              <input
                value={address.number}
                onChange={(e) =>
                  setAddress({ ...address, number: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Complemento</label>
              <input
                value={address.complement}
                onChange={(e) =>
                  setAddress({ ...address, complement: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Bairro *</label>
            <input
              value={address.neighborhood}
              onChange={(e) =>
                setAddress({ ...address, neighborhood: e.target.value })
              }
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Cidade *</label>
              <input
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">UF *</label>
              <input
                value={address.state}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    state: e.target.value.toUpperCase().slice(0, 2),
                  })
                }
                className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Ponto de Referência
            </label>
            <input
              value={address.reference}
              onChange={(e) =>
                setAddress({ ...address, reference: e.target.value })
              }
              placeholder="Próximo ao mercado, em frente à praça..."
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm"
            />
          </div>
        </div>

        {/* MAPA */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Map className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Visualização no Mapa
              </p>
              <p className="text-sm text-gray-500">
                Preencha o endereço para visualizar no mapa
              </p>
            </div>
          </div>

          <div className="h-48 rounded-lg border border-dashed flex items-center justify-center text-sm text-gray-400">
            Mapa será exibido aqui
          </div>
        </div>
      </div>
    </div>
  );
}
