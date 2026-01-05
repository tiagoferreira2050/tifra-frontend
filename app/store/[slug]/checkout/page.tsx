"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<
    "delivery" | "pickup" | "local"
  >("delivery");

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col bg-white">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border flex items-center justify-center"
        >
          ←
        </button>

        <h1 className="text-lg font-semibold">
          Endereço de entrega
        </h1>
      </div>

      {/* ================= CONTEÚDO ================= */}
      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-gray-600 mb-4">
          Como deseja receber seu pedido?
        </p>

        <div className="space-y-3">
          {/* DELIVERY */}
          <label
            className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition ${
              deliveryType === "delivery"
                ? "border-green-600 bg-green-50"
                : ""
            }`}
          >
            <input
              type="radio"
              name="deliveryType"
              checked={deliveryType === "delivery"}
              onChange={() => setDeliveryType("delivery")}
            />
            <span>Receber no meu endereço</span>
          </label>

          {/* LOCAL */}
          <label
            className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition ${
              deliveryType === "local"
                ? "border-green-600 bg-green-50"
                : ""
            }`}
          >
            <input
              type="radio"
              name="deliveryType"
              checked={deliveryType === "local"}
              onChange={() => setDeliveryType("local")}
            />
            <span>Consumir no restaurante</span>
          </label>

          {/* PICKUP */}
          <label
            className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition ${
              deliveryType === "pickup"
                ? "border-green-600 bg-green-50"
                : ""
            }`}
          >
            <input
              type="radio"
              name="deliveryType"
              checked={deliveryType === "pickup"}
              onChange={() => setDeliveryType("pickup")}
            />
            <span>Retirar no restaurante</span>
          </label>
        </div>

        {/* ================= BOTÃO ADICIONAR ENDEREÇO ================= */}
        {deliveryType === "delivery" && (
          <button
            className="w-full mt-6 border border-green-600 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            onClick={() => {
              // 🔥 próximo passo: abrir modal do Google
              router.push("/checkout/address");
            }}
          >
            📍 Adicionar novo endereço
          </button>
        )}
      </div>

      {/* ================= BOTÃO FIXO ================= */}
      <div className="p-6 border-t">
        <button
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          onClick={() => {
            if (deliveryType === "delivery") {
              router.push("/checkout/address");
              return;
            }

            router.push("/checkout/summary");
          }}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
