"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddressModal from "./components/AddressModal";

type SavedAddress = {
  id: number;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
  reference: string;
  lat: number;
  lng: number;
  fee: number;
  eta: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<
    "delivery" | "pickup" | "local"
  >("delivery");

  const [addressModalOpen, setAddressModalOpen] =
    useState(false);

  const [addresses, setAddresses] = useState<
    SavedAddress[]
  >([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);

  // 🔥 ENDEREÇO DA LOJA (mock)
  const storeAddress = {
    street: "Avenida Olegário Maciel",
    number: "573",
    description:
      "Açaí Brasil, ao lado da faixa de pedestre.",
    city: "Caratinga - MG",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Avenida+Olegário+Maciel+573+Caratinga+MG",
  };

  return (
    <>
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
                onChange={() =>
                  setDeliveryType("delivery")
                }
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
                onChange={() =>
                  setDeliveryType("local")
                }
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
                onChange={() =>
                  setDeliveryType("pickup")
                }
              />
              <span>Retirar no restaurante</span>
            </label>
          </div>

          {/* ================= ENDEREÇO DA LOJA ================= */}
          {(deliveryType === "pickup" ||
            deliveryType === "local") && (
            <div className="mt-6 border border-green-600 rounded-xl p-4 bg-green-50">
              <p className="text-sm text-gray-600 mb-1">
                Endereço do restaurante:
              </p>

              <p className="font-semibold">
                {storeAddress.street},{" "}
                {storeAddress.number}
              </p>

              <p className="text-sm">
                {storeAddress.description}
              </p>

              <p className="text-sm text-gray-500">
                {storeAddress.city}
              </p>

              <a
                href={storeAddress.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full border border-green-600 text-green-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                📍 Ver no mapa
              </a>
            </div>
          )}

          {/* ================= ENDEREÇOS DELIVERY ================= */}
          {deliveryType === "delivery" && (
            <>
              <button
                className="w-full mt-6 border border-green-600 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                onClick={() =>
                  setAddressModalOpen(true)
                }
              >
                📍 Adicionar novo endereço
              </button>

              {addresses.length > 0 && (
                <div className="mt-6 space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() =>
                        setSelectedAddressId(
                          addr.id
                        )
                      }
                      className={`border rounded-xl p-4 cursor-pointer transition ${
                        selectedAddressId ===
                        addr.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {addr.street},{" "}
                            {addr.number}
                          </p>
                          <p className="text-sm">
                            {addr.neighborhood}
                          </p>
                          <p className="text-sm text-gray-500">
                            {addr.city} -{" "}
                            {addr.state}
                          </p>

                          <div className="flex gap-4 mt-2 text-sm text-green-600">
                            <span>
                              ⏱ {addr.eta}
                            </span>
                            <span>
                              🚴 R${" "}
                              {addr.fee
                                .toFixed(2)
                                .replace(
                                  ".",
                                  ","
                                )}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedAddressId ===
                            addr.id
                              ? "border-green-600 bg-green-600"
                              : "border-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ================= BOTÃO FIXO ================= */}
        <div className="p-6 border-t">
          <button
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
            onClick={() => {
              if (
                deliveryType === "delivery" &&
                !selectedAddressId
              ) {
                setAddressModalOpen(true);
                return;
              }

              router.push("/checkout/summary");
            }}
          >
            Próximo
          </button>
        </div>
      </div>

      {/* ================= MODAL GOOGLE ================= */}
      <AddressModal
        open={addressModalOpen}
        onClose={() =>
          setAddressModalOpen(false)
        }
        onSave={(addr) => {
          const newAddress: SavedAddress = {
            id: Date.now(),
            ...addr,
            fee: 4.99,
            eta: "40 - 50 min",
          };

          setAddresses((prev) => [
            newAddress,
            ...prev,
          ]);
          setSelectedAddressId(newAddress.id);
        }}
      />
    </>
  );
}
