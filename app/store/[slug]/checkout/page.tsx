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
  const host = window.location.hostname;
  return host.replace(".tifra.com.br", "");
}

export default function CheckoutPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  /* ================= STORE ================= */
  const [storeId, setStoreId] = useState<string | null>(null);

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
      const subdomain = getSubdomain();
      const res = await fetch(
        `${API_URL}/store/by-subdomain/${subdomain}`
      );
      const data = await res.json();
      setStoreId(data.id);
    }

    loadStore();
  }, [API_URL]);

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

        const customer = await res.json();
        if (!customer) {
          setCustomerId(null);
          setAddresses([]);
          return;
        }

        setCustomerId(customer.id);
        setCustomerName(customer.name || "");

        setAddresses(
          (customer.addresses || []).map((addr: any) => ({
            ...addr,
            fee: 4.99,
            eta: "40 - 50 min",
          }))
        );
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

  /* ================= SALVAR ENDEREÇO ================= */
  async function saveAddress(address: any) {
    const cid = await ensureCustomer();

    const res = await fetch(`${API_URL}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        customerId: cid,
        ...address,
      }),
    });

    const data = await res.json();

    setAddresses((prev) => [
      {
        ...data,
        fee: 4.99,
        eta: "40 - 50 min",
      },
      ...prev,
    ]);

    setSelectedAddressId(data.id);
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

  /* ================= UI ================= */
  return (
    <>
      <div className="max-w-xl mx-auto min-h-screen flex flex-col bg-white">
        <div className="flex-1 px-6 py-6 space-y-6">
          <div>
            <label>Telefone *</label>
            <input
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(formatPhone(e.target.value))
              }
            />
          </div>

          <div>
            <label>Nome *</label>
            <input
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
            />
          </div>

          {deliveryType === "delivery" && (
            <>
              <button onClick={() => setAddressModalOpen(true)}>
                📍 Adicionar novo endereço
              </button>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() =>
                    setSelectedAddressId(addr.id)
                  }
                >
                  <strong>
                    {addr.street}, {addr.number}
                  </strong>
                  <div>
                    {addr.neighborhood} – {addr.city}/{addr.state}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <button onClick={handleNext}>Próximo</button>
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={saveAddress}
      />
    </>
  );
}
