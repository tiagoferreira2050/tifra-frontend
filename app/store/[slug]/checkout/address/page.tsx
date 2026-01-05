"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeliveryType = "delivery" | "pickup" | "local";

export default function AddressPage() {
  const router = useRouter();

  const [type, setType] = useState<DeliveryType>("delivery");
  const [address, setAddress] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number>(5.99);

  function handleNext() {
    // aqui no futuro salva no context / backend
    router.push("../summary");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>←</button>
        <h1 className="text-xl font-semibold">
          Endereço de entrega
        </h1>
      </div>

      {/* TIPO DE PEDIDO */}
      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={type === "delivery"}
            onChange={() => setType("delivery")}
          />
          Receber no meu endereço
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={type === "pickup"}
            onChange={() => setType("pickup")}
          />
          Retirar no restaurante
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={type === "local"}
            onChange={() => setType("local")}
          />
          Consumir no local
        </label>
      </div>

      {/* ENDEREÇO */}
      {type === "delivery" && (
        <div className="space-y-3 mb-6">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, bairro"
            className="w-full border rounded-lg p-3"
          />

          <div className="flex justify-between text-sm">
            <span>Taxa de entrega</span>
            <span className="font-semibold">
              R$ {deliveryFee.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      )}

      {/* INFO RETIRADA */}
      {type !== "delivery" && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm mb-6">
          {type === "pickup" &&
            "Você poderá retirar seu pedido diretamente no balcão."}
          {type === "local" &&
            "Seu pedido será consumido no local."}
        </div>
      )}

      {/* AÇÃO */}
      <button
        onClick={handleNext}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
      >
        Continuar
      </button>
    </div>
  );
}
