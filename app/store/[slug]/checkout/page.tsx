"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddressModal from "./components/AddressModal";

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

  useEffect(() => {
    async function loadStore() {
      const subdomain = getSubdomain();
      const res = await fetch(
        `${API_URL}/store/by-subdomain/${subdomain}`
      );
      const data = await res.json();
      setStoreId(data.id);
    }
    loadStore();
  }, [API_URL]);

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

  /* ================= BUSCAR CLIENTE ================= */
  useEffect(() => {
    if (!storeId) return;

    const phone = normalizePhone(customerPhone);
    if (phone.length < 10) {
      setCustomerId(null);
      setAddresses([]);
      return;
    }

    async function fetchCustomer() {
      try {
        setLoadingCustomer(true);

        const res = await fetch(
          `${API_URL}/customers/by-phone?storeId=${storeId}&phone=${phone}`
        );
        const data = await res.json();

        if (!data) {
          setCustomerId(null);
          setAddresses([]);
          return;
        }

        setCustomerId(data.id);
        setCustomerName(data.name || "");

        if (Array.isArray(data.addresses)) {
          const loaded = data.addresses.map((addr: any) => ({
            ...addr,
            fee: 4.99,
            eta: "40 - 50 min",
          }));
          setAddresses(loaded);

          if (loaded.length > 0) {
            setSelectedAddressId(loaded[0].id);
          }
        }
      } finally {
        setLoadingCustomer(false);
      }
    }

    fetchCustomer();
  }, [customerPhone, storeId, API_URL]);

  /* ================= GARANTIR CLIENTE ================= */
  async function ensureCustomer() {
    if (customerId) return customerId;

    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        name: customerName,
        phone: normalizePhone(customerPhone),
      }),
    });

    const data = await res.json();
    setCustomerId(data.id);
    return data.id;
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
          <h1 className="text-lg font-semibold">Endereço de entrega</h1>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 px-6 py-6 space-y-6">
          {/* CLIENTE */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Telefone *</label>
              <input
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(formatPhone(e.target.value))
                }
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
              {loadingCustomer && (
                <p className="text-xs text-gray-500 mt-1">
                  Buscando cliente...
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Nome *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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
                className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer ${
                  deliveryType === type
                    ? "border-green-600 bg-green-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  checked={deliveryType === type}
                  onChange={() => setDeliveryType(type as any)}
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

          {/* ENDEREÇOS */}
          {deliveryType === "delivery" && (
            <>
              <button
                className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold"
                onClick={() => setAddressModalOpen(true)}
              >
                📍 Adicionar novo endereço
              </button>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`border rounded-xl p-4 cursor-pointer ${
                    selectedAddressId === addr.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <p className="font-semibold">
                    {addr.street}, {addr.number}
                  </p>
                  <p className="text-sm">{addr.neighborhood}</p>
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
        onClose={() => setAddressModalOpen(false)}
        onSave={async (addr) => {
          const cid = await ensureCustomer();

          const res = await fetch(`${API_URL}/addresses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storeId,
              customerId: cid,
              ...addr,
            }),
          });

          const data = await res.json();

          const newAddress: SavedAddress = {
            ...data,
            fee: 4.99,
            eta: "40 - 50 min",
          };

          setAddresses((prev) => [newAddress, ...prev]);
          setSelectedAddressId(newAddress.id);
        }}
      />
    </>
  );
}
