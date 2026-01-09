"use client";

import { useState } from "react";

type Mode = "RADIUS" | "NEIGHBORHOOD";

export default function EntregaPage() {
  const [mode, setMode] = useState<Mode>("RADIUS");
  const [freeShipping, setFreeShipping] = useState(false);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚚</span>
          <div>
            <h1 className="text-xl font-semibold">Configuração de Entrega</h1>
            <p className="text-sm text-gray-500">
              Configure raios, bairros e taxas de entrega
            </p>
          </div>
        </div>

        <button className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white">
          Salvar
        </button>
      </div>

      {/* TOGGLE MODO */}
      <div className="rounded-lg bg-gray-100 p-1 flex gap-1">
        <button
          onClick={() => setMode("RADIUS")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition
            ${mode === "RADIUS" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}
          `}
        >
          📍 Por Raio (km)
          <span className="rounded-full bg-gray-200 px-2 text-xs">1</span>
        </button>

        <button
          onClick={() => setMode("NEIGHBORHOOD")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition
            ${mode === "NEIGHBORHOOD" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}
          `}
        >
          🏘️ Por Bairro
          <span className="rounded-full bg-gray-200 px-2 text-xs">0</span>
        </button>
      </div>

      {/* =======================
          POR RAIO
      ======================= */}
      {mode === "RADIUS" && (
        <div className="space-y-6">
          {/* MAPA PLACEHOLDER */}
          <div className="flex h-44 items-center justify-center rounded-lg border border-dashed bg-gray-50 text-center">
            <div className="space-y-1">
              <div className="text-3xl">🗺️</div>
              <p className="text-sm font-medium">Mapa não disponível</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Adicione uma chave da API do Google Maps para visualizar os raios
                de entrega no mapa.
              </p>
            </div>
          </div>

          {/* ZONAS */}
          <div className="rounded-lg border bg-white p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">Zonas de Entrega</h2>
                <p className="text-sm text-gray-500">
                  Configure diferentes taxas para cada faixa de distância
                </p>
              </div>

              <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
                + Adicionar Zona
              </button>
            </div>

            {/* ZONA */}
            <div className="rounded-lg border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">📍 13 – 16 km</p>
                  <p className="text-sm text-gray-500">⏱ 30–45 min</p>
                </div>

                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500">De (km)</label>
                  <input className="h-10 w-full rounded-md border px-3 text-sm" value="13" readOnly />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Até (km)</label>
                  <input className="h-10 w-full rounded-md border px-3 text-sm" value="16" readOnly />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Taxa (R$)</label>
                  <input className="h-10 w-full rounded-md border px-3 text-sm" value="18" readOnly />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Tempo</label>
                  <input className="h-10 w-full rounded-md border px-3 text-sm" value="30–45 min" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================
          POR BAIRRO
      ======================= */}
      {mode === "NEIGHBORHOOD" && (
        <div className="rounded-lg border bg-white p-6 space-y-5">
          <div>
            <h2 className="font-medium">Bairros Atendidos</h2>
            <p className="text-sm text-gray-500">
              Configure taxas específicas para cada bairro
            </p>
          </div>

          <div className="flex gap-3">
            <input
              placeholder="Nome do bairro..."
              className="h-11 flex-1 rounded-md border px-4 text-sm"
            />
            <button className="rounded-md bg-black px-4 text-sm text-white">
              + Adicionar
            </button>
          </div>

          {/* EMPTY STATE */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center text-gray-400">
            <div className="text-4xl mb-2">🏠</div>
            <p className="font-medium text-gray-600">
              Nenhum bairro cadastrado
            </p>
            <p className="text-sm">
              Adicione bairros para configurar as taxas de entrega
            </p>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÕES GERAIS */}
      <div className="rounded-lg border bg-white p-6 space-y-6">
        <h2 className="font-medium">Configurações Gerais</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Pedido mínimo</p>
            <p className="text-sm text-gray-500">
              Valor mínimo para aceitar pedidos de entrega
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">R$</span>
            <input
              className="h-10 w-24 rounded-md border px-3 text-sm"
              value="0"
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div>
            <p className="font-medium">Frete Grátis</p>
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
  );
}
