"use client";

import { useState } from "react";
import {
  Truck,
  MapPin,
  Home,
  Plus,
  Save,
  Settings,
  DollarSign,
} from "lucide-react";

type Mode = "RADIUS" | "NEIGHBORHOOD";

export default function EntregaPage() {
  const [mode, setMode] = useState<Mode>("RADIUS");
  const [freeShipping, setFreeShipping] = useState(false);

  const activeRadiusZones = 1;
  const activeNeighborhoods = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Truck className="h-5 w-5 text-gray-700" />
              Configuração de Entrega
            </h1>
            <p className="text-sm text-gray-500">
              Configure raios, bairros e taxas de entrega
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* TOGGLE */}
        <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setMode("RADIUS")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition
              ${
                mode === "RADIUS"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <MapPin className="h-4 w-4" />
            Por Raio (km)
            {mode === "RADIUS" && (
              <span className="ml-1 rounded-full bg-gray-200 px-2 text-xs">
                {activeRadiusZones}
              </span>
            )}
          </button>

          <button
            onClick={() => setMode("NEIGHBORHOOD")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition
              ${
                mode === "NEIGHBORHOOD"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <Home className="h-4 w-4" />
            Por Bairro
            {mode === "NEIGHBORHOOD" && (
              <span className="ml-1 rounded-full bg-gray-200 px-2 text-xs">
                {activeNeighborhoods}
              </span>
            )}
          </button>
        </div>

        {/* ======================
            POR RAIO
        ====================== */}
        {mode === "RADIUS" && (
          <div className="space-y-6">
            {/* MAP PLACEHOLDER */}
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-white text-center">
              <div className="space-y-2">
                <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Mapa não disponível
                </p>
                <p className="text-xs text-gray-500 max-w-sm">
                  Adicione uma chave da API do Google Maps para visualizar os
                  raios de entrega no mapa.
                </p>
              </div>
            </div>

            {/* ZONAS */}
            <div className="rounded-xl border bg-white p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Zonas de Entrega
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configure diferentes taxas para cada faixa de distância
                  </p>
                </div>

                <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4" />
                  Adicionar Zona
                </button>
              </div>

              {/* ZONA */}
              <div className="rounded-lg border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      13 – 16 km
                    </p>
                    <p className="text-sm text-gray-500">30–45 min</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "De (km)", value: "13" },
                    { label: "Até (km)", value: "16" },
                    { label: "Taxa (R$)", value: "18" },
                    { label: "Tempo", value: "30–45 min" },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1">
                      <label className="text-xs text-gray-500">
                        {field.label}
                      </label>
                      <input
                        readOnly
                        value={field.value}
                        className="h-10 w-full rounded-md border bg-gray-50 px-3 text-sm text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================
            POR BAIRRO
        ====================== */}
        {mode === "NEIGHBORHOOD" && (
          <div className="rounded-xl border bg-white p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Bairros Atendidos
              </h2>
              <p className="text-sm text-gray-500">
                Configure taxas específicas para cada bairro
              </p>
            </div>

            <div className="flex gap-3">
              <input
                placeholder="Nome do bairro..."
                className="h-11 flex-1 rounded-md border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 text-sm text-white hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <Home className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Nenhum bairro cadastrado
              </p>
              <p className="text-sm text-gray-500">
                Adicione bairros para configurar as taxas de entrega
              </p>
            </div>
          </div>
        )}

        {/* CONFIGURAÇÕES GERAIS */}
        <div className="rounded-xl border bg-white p-6 space-y-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Settings className="h-4 w-4 text-gray-600" />
            Configurações Gerais
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Pedido mínimo
              </p>
              <p className="text-sm text-gray-500">
                Valor mínimo para aceitar pedidos de entrega
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">R$</span>
              <input
                readOnly
                value="0"
                className="h-10 w-24 rounded-md border bg-gray-50 px-3 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Frete Grátis</p>
              <p className="text-sm text-gray-500">
                Ofereça entrega grátis acima de um valor mínimo
              </p>
            </div>

            <input
              type="checkbox"
              checked={freeShipping}
              onChange={() => setFreeShipping(!freeShipping)}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
