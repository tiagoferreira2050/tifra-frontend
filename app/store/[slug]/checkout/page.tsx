"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export default function CheckoutPage() {
  const router = useRouter();

  /* ================= CONFIG ================= */
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const storeId = "STORE_ID_AQUI"; // 🔥 troque pelo real

  /* ================= CLIENTE ================= */
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  /* ================= ENTREGA ================= */
  const [deliveryType, setDeliveryType] = useState<
    "delivery" | "pickup" | "local"
  >("delivery");

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);

  /* ================= BUSCAR CLIENTE ================= */
  useEffect(() => {
    const phone = onlyNumbers(customerPhone);

    if (phone.length < 10) return;

    async function fetchCustomer() {
      try {
        setLoadingCustomer(true);

        const res = await fetch(
          `${API_URL}/customers/by-phone?storeId=${storeId}&phone=${phone}`
        );

        const data = await res.json();

        if (data) {
          setCustomerId(data.id);
          setCustomerName(data.name || "");

          if (Array.isArray(data.addresses)) {
            setAddresses(
              data.addresses.map((addr: any) => ({
                ...addr,
                fee: 4.99,
                eta: "40 - 50 min",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Erro ao buscar cliente");
      } finally {
        setLoadingCustomer(false);
      }
    }

    fetchCustomer();
  }, [customerPhone]);

  /* ================= GARANTIR CLIENTE ================= */
  async function ensureCustomer() {
    if (customerId) return customerId;

    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        name: customerName,
        phone: onlyNumbers(customerPhone),
      }),
    });

    const data = await res.json();
    setCustomerId(data.id);
    return data.id;
  }

  /* ================= CONTINUAR ================= */
  async function handleNext() {
    if (!customerPhone || !customerName) {
      alert("Informe telefone e nome para continuar");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddressId) {
      setAddressModalOpen(true);
      return;
    }

    await ensureCustomer();

    router.push("/checkout/summary");
  }

  return (
    <>
      <div className="max-w-xl mx-auto min-h-screen flex flex-col bg-white">
        {/* HEADER */}
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

        {/* CONTEÚDO */}
        <div className="flex-1 px-6 py-6 space-y-6">
          {/* CLIENTE */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Telefone *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(formatPhone(e.target.value))
                }
                placeholder="(DDD) 99999-9999"
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
              {loadingCustomer && (
                <p className="text-xs text-gray-500 mt-1">
                  Buscando cliente...
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Nome *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Seu nome"
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* ENTREGA */}
          <p className="text-sm text-gray-600">
            Como deseja receber seu pedido?
          </p>

          <div className="space-y-3">
            {["delivery", "local", "pickup"].map((type) => (
              <label
                key={type}
                className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition ${
                  deliveryType === type
                    ? "border-green-600 bg-green-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  checked={deliveryType === type}
                  onChange={() =>
                    setDeliveryType(type as any)
                  }
                />
                <span>
                  {type === "delivery"
                    ? "Receber no meu endereço"
                    : type === "local"
                    ? "Consumir no restaurante"
                    : "Retirar no restaurante"}
                </span>
              </label>
            ))}
          </div>

          {/* ENDEREÇOS DELIVERY */}
          {deliveryType === "delivery" && (
            <>
              <button
                className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold"
                onClick={() =>
                  setAddressModalOpen(true)
                }
              >
                📍 Adicionar novo endereço
              </button>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() =>
                    setSelectedAddressId(addr.id)
                  }
                  className={`border rounded-xl p-4 cursor-pointer ${
                    selectedAddressId === addr.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <p className="font-semibold">
                    {addr.street}, {addr.number}
                  </p>
                  <p className="text-sm">
                    {addr.neighborhood}
                  </p>
                  <p className="text-sm text-gray-500">
                    {addr.city} - {addr.state}
                  </p>

                  <div className="flex gap-4 mt-2 text-sm text-green-600">
                    <span>⏱ {addr.eta}</span>
                    <span>🚴 R$ {addr.fee.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* BOTÃO */}
        <div className="p-6 border-t">
          <button
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
            onClick={handleNext}
          >
            Próximo
          </button>
        </div>
      </div>

      {/* MODAL ENDEREÇO */}
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
