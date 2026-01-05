"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<
    "delivery" | "pickup" | "local"
  >("delivery");

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full border flex items-center justify-center"
        >
          ←
        </button>

        <h1 className="text-xl font-semibold">
          Endereço de entrega
        </h1>
      </div>

      {/* TIPO DE PEDIDO */}
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Como deseja receber seu pedido?
        </p>

        <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
          <input
            type="radio"
            checked={deliveryType === "delivery"}
            onChange={() => setDeliveryType("delivery")}
          />
          <span>Receber no meu endereço</span>
        </label>

        <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
          <input
            type="radio"
            checked={deliveryType === "local"}
            onChange={() => setDeliveryType("local")}
          />
          <span>Consumir no restaurante</span>
        </label>

        <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
          <input
            type="radio"
            checked={deliveryType === "pickup"}
            onChange={() => setDeliveryType("pickup")}
          />
          <span>Retirar no restaurante</span>
        </label>
      </div>

      {/* BOTÃO */}
      <button
        className="w-full mt-8 bg-green-600 text-white py-3 rounded-xl font-semibold"
        onClick={() => {
          // 👉 se for delivery, vai para endereço
          if (deliveryType === "delivery") {
            router.push("checkout/address");
            return;
          }

          // 👉 se for retirada ou local, pula endereço
          router.push("checkout/summary");
        }}
      >
        Próximo
      </button>
    </div>
  );
}
