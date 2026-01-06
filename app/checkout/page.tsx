"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddressModal from "./components/AddressModal";
import { useCart } from "@/src/contexts/CartContext";

/* ================= TYPES ================= */
type SavedAddress = {
  id: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  reference?: string;
  lat: number;
  lng: number;
  fee: number;
  eta: string;
};

/* ================= HELPERS ================= */
function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14);
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, storeId, setCheckoutData } = useCart();

  /* ================= CLIENTE ================= */
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");

  /* ================= ENTREGA ================= */
  const [deliveryType, setDeliveryType] =
    useState<"delivery" | "pickup" | "local">("delivery");

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  /* ================= PROTEÇÕES ================= */
  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Loja inválida
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Seu carrinho está vazio
      </div>
    );
  }

  /* ================= SALVAR ENDEREÇO ================= */
  function saveAddress(address: any) {
    const newAddress: SavedAddress = {
      id: crypto.randomUUID(),
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      number: address.number,
      reference: address.reference,
      lat: address.lat,
      lng: address.lng,
      fee: 4.99,
      eta: "40–50 min",
    };

    setAddresses((prev) => [newAddress, ...prev]);
    setSelectedAddressId(newAddress.id);
    setAddressModalOpen(false);
  }

  /* ================= CONTINUAR ================= */
  function handleNext() {
    if (!customerPhone || !customerName) {
      alert("Informe telefone e nome");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddress) {
      setAddressModalOpen(true);
      return;
    }

    // 🔥 SALVA DADOS DO CHECKOUT NO CONTEXT
    setCheckoutData({
      customerName,
      customerPhone,
      deliveryType,
      address:
        deliveryType === "delivery" ? selectedAddress : undefined,
    });

    router.push("/checkout/summary");
  }

  return (
    <>
      <div className="max-w-xl mx-auto min-h-screen flex flex-col bg-white">
        <div className="flex-1 px-6 py-6 space-y-6">
          {/* CLIENTE */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Celular
              </label>
              <input
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(formatPhone(e.target.value))
                }
                placeholder="(00) 00000-0000"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nome
              </label>
              <input
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Nome do cliente"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {/* ENTREGA */}
          <h1 className="text-lg font-semibold text-center">
            Endereço de entrega
          </h1>

          <div className="space-y-3">
            {[
              { id: "delivery", label: "Receber no meu endereço" },
              { id: "local", label: "Consumir no restaurante" },
              { id: "pickup", label: "Retirar no restaurante" },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-3 text-sm"
              >
                <input
                  type="radio"
                  checked={deliveryType === opt.id}
                  onChange={() => {
                    setDeliveryType(opt.id as any);
                    if (opt.id !== "delivery") {
                      setSelectedAddressId(null);
                    }
                  }}
                  className="accent-green-600"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* ENDEREÇOS */}
          {deliveryType === "delivery" && (
            <>
              <button
                onClick={() => setAddressModalOpen(true)}
                className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-medium"
              >
                📍 Adicionar novo endereço
              </button>

              {addresses.map((addr) => {
                const selected = addr.id === selectedAddressId;

                return (
                  <div
                    key={addr.id}
                    onClick={() =>
                      setSelectedAddressId(addr.id)
                    }
                    className={`border rounded-lg p-4 cursor-pointer ${
                      selected
                        ? "border-green-600"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-semibold">
                      {addr.street}, {addr.number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {addr.neighborhood}
                    </p>
                    <p className="text-sm text-gray-500">
                      {addr.city} - {addr.state}
                    </p>

                    {selected && (
                      <div className="flex gap-4 mt-2 text-sm text-green-600">
                        <span>⏱ {addr.eta}</span>
                        <span>
                          🚚 R$ {addr.fee.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={handleNext}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold"
          >
            Próximo
          </button>
        </div>
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={saveAddress}
      />
    </>
  );
}
