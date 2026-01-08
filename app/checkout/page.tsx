"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddressModal from "./components/AddressModal";
import { useCart } from "@/src/contexts/CartContext";

type SavedAddress = {
  id: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement?: string;
  reference?: string;
  lat: number;
  lng: number;
  fee: number;
  eta: string;
};

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
  const { items, storeId, setCheckoutData } = useCart();

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [deliveryType, setDeliveryType] =
    useState<"delivery" | "pickup" | "local">("delivery");

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  /* ===============================
     🔥 BUSCAR CLIENTE PELO TELEFONE
  =============================== */
  useEffect(() => {
    async function loadCustomer() {
      const phone = normalizePhone(customerPhone);
      if (phone.length < 10 || !storeId) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/customers/by-phone?storeId=${storeId}&phone=${phone}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data?.name) {
          setCustomerName(data.name);
        }

        if (Array.isArray(data?.addresses)) {
          const loaded: SavedAddress[] = data.addresses.map((addr: any) => ({
            id: addr.id,
            street: addr.street,
            number: addr.number,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            complement: addr.complement ?? undefined,
            reference: addr.reference ?? undefined,
            lat: addr.lat,
            lng: addr.lng,
            fee: 4.99,
            eta: "40–50 min",
          }));

          setAddresses(loaded);
          setSelectedAddressId(loaded[0]?.id ?? null);
        }
      } catch (err) {
        console.error("Erro ao carregar cliente", err);
      }
    }

    loadCustomer();
  }, [customerPhone, storeId]);

  /* ===============================
     PROTEÇÕES
  =============================== */
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

  /* ===============================
     NOVO ENDEREÇO (SEM DUPLICAR)
  =============================== */
  function saveAddress() {
    // 👉 NÃO cria endereço local
    // backend já salva e evita duplicação
    setAddressModalOpen(false);

    // força reload dos endereços pelo telefone
    setTimeout(() => {
      setCustomerPhone((prev) => prev);
    }, 300);
  }

  function handleNext() {
    if (!customerPhone || !customerName) {
      alert("Informe telefone e nome");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddress) {
      alert("Selecione um endereço");
      return;
    }

    setCheckoutData({
      customerName,
      customerPhone,
      deliveryType,
      address:
        deliveryType === "delivery"
          ? {
              ...selectedAddress!,
            }
          : undefined,
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

          {/* ENDEREÇO */}
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

                    {addr.reference && (
                      <p className="text-xs text-gray-400 mt-1">
                        Ref: {addr.reference}
                      </p>
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
