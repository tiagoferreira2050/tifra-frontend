"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export default function CheckoutPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
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

  /* ===============================
     BUSCAR CLIENTE PELO TELEFONE
  =============================== */
  useEffect(() => {
    async function loadCustomer() {
      const phone = normalizePhone(customerPhone);
      if (phone.length < 10 || !storeId) return;

      try {
        const res = await fetch(
          `${API_URL}/api/public/customers/by-phone?storeId=${storeId}&phone=${phone}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data?.name) setCustomerName(data.name);

        if (Array.isArray(data?.addresses)) {
          setAddresses(data.addresses);
          setSelectedAddressId(data.addresses[0]?.id ?? null);
        }
      } catch (err) {
        console.error("Erro ao carregar cliente", err);
      }
    }

    loadCustomer();
  }, [customerPhone, storeId, API_URL]);

  /* ===============================
     SALVAR ENDEREÇO (STATE)
  =============================== */
  function saveAddress(address: SavedAddress) {
    setAddresses((prev) => {
      const exists = prev.find(
        (a) =>
          a.street === address.street &&
          a.number === address.number &&
          a.city === address.city
      );
      if (exists) return prev;
      return [address, ...prev];
    });

    setSelectedAddressId(address.id);
    setAddressModalOpen(false);
  }

  /* ===============================
     EXCLUIR ENDEREÇO (BANCO)
  =============================== */
  async function handleDeleteAddress(id: string) {
    if (!confirm("Deseja excluir este endereço?")) return;

    try {
      await fetch(`${API_URL}/api/addresses/${id}`, {
        method: "DELETE",
      });

      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
    } catch (err) {
      console.error("Erro ao excluir endereço", err);
    }
  }

  /* ===============================
     CONTINUAR
  =============================== */
  function handleNext() {
    if (!customerPhone || !customerName) {
      alert("Informe telefone e nome");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddress) {
      alert("Selecione um endereço de entrega");
      return;
    }

    setCheckoutData({
      customerName,
      customerPhone,
      deliveryType,
      address: deliveryType === "delivery" ? selectedAddress : undefined,
    });

    router.push("/checkout/summary");
  }

  /* ================= RENDER ================= */
  return (
    <>
      <div className="max-w-xl mx-auto min-h-screen bg-white flex flex-col">
        <div className="flex-1 px-6 py-6 space-y-8">
          {/* ================= DADOS DO CLIENTE ================= */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              DADOS DO CLIENTE
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Celular</label>
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
                <label className="block text-sm mb-1">Nome</label>
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
          </div>

          {/* ================= DADOS DE ENTREGA ================= */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              DADOS DE ENTREGA
            </h2>

            <p className="text-sm text-gray-600 mb-3">
              Como deseja receber seu pedido?
            </p>

            <div className="space-y-3">
              {[
                { id: "delivery", label: "Receber no meu endereço" },
                { id: "local", label: "Consumir no restaurante" },
                { id: "pickup", label: "Retirar no restaurante" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3"
                >
                  <input
                    type="radio"
                    checked={deliveryType === opt.id}
                    onChange={() => setDeliveryType(opt.id as any)}
                    className="accent-green-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* ================= ENDEREÇOS ================= */}
          {deliveryType === "delivery" && (
            <div className="space-y-4">
              <button
                onClick={() => setAddressModalOpen(true)}
                className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-medium"
              >
                📍 Adicionar novo endereço
              </button>

              <div className="space-y-3">
                {addresses.map((addr) => {
                  const selected = addr.id === selectedAddressId;

                  return (
                    <div
                      key={addr.id}
                      className={`border rounded-lg p-4 flex justify-between items-start cursor-pointer ${
                        selected
                          ? "border-green-600"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        setSelectedAddressId(addr.id)
                      }
                    >
                      <div>
                        <p className="font-semibold">
                          {addr.street}, {addr.number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.neighborhood}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.city} - {addr.state}
                        </p>
                        {addr.reference && (
                          <p className="text-xs text-gray-400">
                            Ref: {addr.reference}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(addr.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
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
