"use client";

import { useState } from "react";

export default function EntregaPage() {
  const [mode, setMode] = useState<"RADIUS" | "NEIGHBORHOOD">("RADIUS");
  const [freeShipping, setFreeShipping] = useState(true);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🚚 Configuração de Entrega
          </h1>
          <p className="text-sm text-gray-500">
            Configure raios, bairros e taxas de entrega
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
          💾 Salvar
        </button>
      </div>

      {/* ENDEREÇO */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">📍 Endereço da Loja</h2>
        <p className="text-sm text-gray-500">
          O endereço será usado como ponto central para calcular as distâncias de
          entrega
        </p>

        <input
          value="Av Olegario Maciel 573"
          disabled
          className="h-11 w-full rounded-md border px-4 text-sm bg-gray-50"
        />

        <p className="text-xs text-gray-400">
          💡 Adicione uma chave da API do Google Maps para busca automática de
          endereços
        </p>
      </div>

      {/* TOGGLE MODO */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setMode("RADIUS")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            mode === "RADIUS"
              ? "bg-white shadow"
              : "text-gray-500 hover:text-black"
          }`}
        >
          📍 Por Raio (km)
          <span className="ml-2 rounded-full bg-gray-200 px-2 text-xs">3</span>
        </button>

        <button
          onClick={() => setMode("NEIGHBORHOOD")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            mode === "NEIGHBORHOOD"
              ? "bg-white shadow"
              : "text-gray-500 hover:text-black"
          }`}
        >
          🏘️ Por Bairro
          <span className="ml-2 rounded-full bg-gray-200 px-2 text-xs">3</span>
        </button>
      </div>

      {/* =========================
          POR RAIO
      ========================= */}
      {mode === "RADIUS" && (
        <>
          {/* MAPA */}
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-gray-50 text-center">
            <div>
              <div className="text-2xl">🗺️</div>
              <p className="font-medium">Mapa não disponível</p>
              <p className="text-sm text-gray-500">
                Adicione uma chave da API do Google Maps para visualizar os raios
                de entrega no mapa.
              </p>
            </div>
          </div>

          {/* ZONAS POR RAIO */}
          <div className="rounded-lg border bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Zonas de Entrega</h2>
                <p className="text-sm text-gray-500">
                  Configure diferentes taxas por distância
                </p>
              </div>

              <button className="rounded-md bg-black px-3 py-2 text-sm text-white">
                ➕ Adicionar Zona
              </button>
            </div>

            {[
              { from: 0, to: 2, price: 5, time: "20-30 min" },
              { from: 2, to: 5, price: 8, time: "30-45 min" },
              { from: 5, to: 10, price: 12, time: "45-60 min" },
            ].map((zone, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    📍 {zone.from} - {zone.to} km
                    <div className="text-sm text-gray-500">⏱ {zone.time}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked />
                    🗑️
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <input className="h-10 rounded-md border px-3 text-sm" value={zone.from} readOnly />
                  <input className="h-10 rounded-md border px-3 text-sm" value={zone.to} readOnly />
                  <input className="h-10 rounded-md border px-3 text-sm" value={zone.price} readOnly />
                  <input className="h-10 rounded-md border px-3 text-sm" value={zone.time} readOnly />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =========================
          POR BAIRRO
      ========================= */}
      {mode === "NEIGHBORHOOD" && (
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Bairros Atendidos</h2>
            <p className="text-sm text-gray-500">
              Configure taxas específicas para cada bairro
            </p>
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Nome do bairro..."
              className="h-11 flex-1 rounded-md border px-4 text-sm"
            />
            <button className="rounded-md bg-black px-4 text-sm text-white">
              ➕ Adicionar
            </button>
          </div>

          {[
            { name: "Centro", price: 5, time: "20-30 min" },
            { name: "Jardim América", price: 7, time: "25-35 min" },
          ].map((bairro, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  🏘️ {bairro.name}
                  <div className="text-sm text-gray-500">⏱ {bairro.time}</div>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked />
                  🗑️
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="h-10 rounded-md border px-3 text-sm"
                  value={bairro.price}
                  readOnly
                />
                <input
                  className="h-10 rounded-md border px-3 text-sm"
                  value={bairro.time}
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIGURAÇÕES GERAIS */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">⚙️ Configurações Gerais</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Pedido mínimo</p>
            <p className="text-sm text-gray-500">
              Valor mínimo para aceitar pedidos de entrega
            </p>
          </div>

          <input
            className="h-10 w-28 rounded-md border px-3 text-sm"
            value="0"
            readOnly
          />
        </div>

        <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
          <div>
            <p className="font-medium">🚚 Frete Grátis</p>
            <p className="text-sm text-gray-500">
              Ofereça entrega grátis acima de um valor mínimo
            </p>
          </div>

          <input
            type="checkbox"
            checked={freeShipping}
            onChange={() => setFreeShipping(!freeShipping)}
          />
        </div>

        {freeShipping && (
          <div className="text-sm text-gray-600">
            Pedidos acima de <strong>R$ 50</strong> têm entrega grátis
          </div>
        )}
      </div>

      {/* RESUMO */}
      <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          🚚
          <div>
            <p className="text-sm font-medium">Resumo</p>
            <p className="text-xs text-gray-500">
              {mode === "RADIUS"
                ? "3 zonas de raio configuradas"
                : "3 bairros configurados"}{" "}
              • Frete grátis acima de R$ 50,00
            </p>
          </div>
        </div>

        <span className="rounded-full border px-3 py-1 text-xs">
          {mode === "RADIUS" ? "Modo Raio" : "Modo Bairro"}
        </span>
      </div>
    </div>
  );
}
