"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddressModal from "./components/AddressModal";

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

function normalizePhone(value: string) {
  let phone = value.replace(/\D/g, "");
  if (phone.startsWith("55") && phone.length > 11) {
    phone = phone.slice(2);
  }
  return phone;
}

function getSubdomain() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.replace(".tifra.com.br", "");
}

export default function CheckoutPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  /* ================= STORE ================= */
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  /* ================= CLIENTE ================= */
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  /* ================= ENTREGA ================= */
  const [deliveryType, setDeliveryType] =
    useState<"delivery" | "pickup" | "local">("delivery");

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  /* ================= LOAD STORE ================= */
  useEffect(() => {
    async function loadStore() {
      try {
        const subdomain = getSubdomain();
        const res = await fetch(
          `${API_URL}/store/by-subdomain/${subdomain}`
        );
        const data = await res.json();
        setStoreId(data.store.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStore(false);
      }
    }

    loadStore();
  }, [API_URL]);

  /* ================= SALVAR ENDEREÇO (INSTANTÂNEO) ================= */
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
      eta: "40 - 50 min",
    };

    setAddresses((prev) => [newAddress, ...prev]);
    setSelectedAddressId(newAddress.id);
    setAddressModalOpen(false);
  }

  /* ================= CONTINUAR ================= */
  async function handleNext() {
    if (!customerPhone || !customerName) {
      alert("Informe telefone e nome");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddressId) {
      setAddressModalOpen(true);
      return;
    }

    router.push("/checkout/summary");
  }

  if (loadingStore) {
    return <div className="p-6">Carregando...</div>;
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
              {loadingCustomer && (
                <p className="text-xs text-gray-500 mt-1">
                  Buscando cliente…
                </p>
              )}
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
            <p className="text-sm text-gray-500">
              Como deseja receber seu pedido?
            </p>

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

              {addresses.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nenhum endereço cadastrado ainda
                </p>
              )}

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
