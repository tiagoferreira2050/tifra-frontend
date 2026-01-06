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

  /* ================= BUSCAR CLIENTE ================= */
  useEffect(() => {
    if (!storeId) return;

    const phone = normalizePhone(customerPhone);
    if (phone.length < 10) {
      setCustomerId(null);
      setAddresses([]);
      setSelectedAddressId(null);
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
          setSelectedAddressId(null);
          return;
        }

        setCustomerId(customer.id);
        setCustomerName(customer.name || "");

        const loaded =
          (customer.addresses || []).map((addr: any) => ({
            id: addr.id,
            street: addr.street,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            number: addr.number,
            reference: addr.reference,
            lat: addr.lat,
            lng: addr.lng,
            fee: 4.99,
            eta: "40 - 50 min",
          })) || [];

        setAddresses(loaded);
        if (loaded.length > 0) {
          setSelectedAddressId(loaded[0].id);
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

  /* ================= SALVAR ENDEREÇO (OTIMISTA) ================= */
  async function saveAddress(address: any) {
    const tempId = crypto.randomUUID();

    const optimistic: SavedAddress = {
      id: tempId,
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

    // 🔥 aparece instantaneamente
    setAddresses((prev) => [optimistic, ...prev]);
    setSelectedAddressId(tempId);
    setAddressModalOpen(false);

    // tenta salvar no backend sem travar fluxo
    try {
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

      if (data?.id) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === tempId ? { ...a, id: data.id } : a
          )
        );
        setSelectedAddressId(data.id);
      }
    } catch (err) {
      console.error("Erro ao salvar endereço:", err);
    }
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

  if (loadingStore) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <>
      {/* JSX INALTERADO */}
      {/* ... exatamente como você já tinha */}
      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={saveAddress}
      />
    </>
  );
}
