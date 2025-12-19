"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ModalSelecionarComplementos from "./ModalSelecionarComplementos";

export default function NovoPedidoDrawer({ open, onClose, onCreate }: any) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("entrega");

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [items, setItems] = useState<any[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [openProductModal, setOpenProductModal] = useState(false);

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [deliveryFee, setDeliveryFee] = useState("0,00");

  const storeId =
    typeof window !== "undefined"
      ? localStorage.getItem("storeId")
      : null;

  // =====================================================
  // 🔥 CARREGAR PRODUTOS (PDV)
  // =====================================================
  useEffect(() => {
    if (!open || !storeId) return;

    let mounted = true;

    async function loadProducts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/products/pdv?storeId=${storeId}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Erro ao buscar produtos");

        const data = await res.json();
        if (!mounted) return;

        setAllProducts(data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setAllProducts([]);
      }
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [open, storeId]);

  const filteredProducts = allProducts.filter((prod) =>
    prod.name.toLowerCase().includes(search.toLowerCase())
  );

  function formatCurrency(value: string) {
    const onlyNums = String(value).replace(/\D/g, "");
    if (!onlyNums) return "0,00";
    return (parseInt(onlyNums, 10) / 100).toFixed(2).replace(".", ",");
  }

  function toNumber(val: string) {
    const num = Number(val.replace(",", "."));
    return isNaN(num) ? 0 : num;
  }

  function cleanCEP(value: string) {
    return String(value).replace(/\D/g, "");
  }

  // =====================================================
  // 🔥 CEP AUTOMÁTICO
  // =====================================================
  useEffect(() => {
    const raw = cleanCEP(cep);
    if (raw.length !== 8) {
      setCepError(null);
      return;
    }

    let mounted = true;

    async function fetchCep() {
      try {
        setCepLoading(true);
        setCepError(null);

        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (!mounted) return;

        if (!res.ok) {
          setCepError("Erro ao consultar CEP");
          return;
        }

        const data = await res.json();
        if (data.erro) {
          setCepError("CEP não encontrado");
          return;
        }

        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setStateUf(data.uf || "");
        setCepError(null);
      } catch {
        setCepError("Erro ao consultar CEP");
      } finally {
        if (mounted) setCepLoading(false);
      }
    }

    fetchCep();
    return () => {
      mounted = false;
    };
  }, [cep]);

  // =====================================================
  // 🔥 CRIAR PEDIDO
  // =====================================================
  async function handleCreate() {
    if (!customer.trim()) {
      alert("Digite o nome do cliente");
      return;
    }

    const payload = {
      storeId,
      customer: {
        name: customer,
        phone,
        address:
          deliveryType === "entrega"
            ? `${street}, ${number}${complement ? " - " + complement : ""} - ${neighborhood} - ${city} - ${stateUf} (CEP: ${cep})`
            : "-",
      },
      items: items.map((it: any) => ({
        productId: it.productId,
        quantity: it.qty,
        unitPrice: it.price,
        complements: it.complements || [],
      })),
      paymentMethod,
      deliveryFee: deliveryType === "entrega" ? toNumber(deliveryFee) : 0,
      total:
        items.reduce(
          (acc, v) => acc + Number(v.price) * v.qty,
          0
        ) + (deliveryType === "entrega" ? toNumber(deliveryFee) : 0),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        alert("Erro ao criar pedido");
        return;
      }

      const saved = await res.json();
      if (onCreate) onCreate(saved);

      onClose();
      setCustomer("");
      setPhone("");
      setItems([]);
      setDeliveryType("entrega");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar pedido");
    }
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl border-l 
      transition-all duration-300 z-50
      ${open ? "w-[70%] opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Novo Pedido</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 h-full">
        {/* ESQUERDA */}
        <div className="p-4 overflow-y-auto border-r">
          <input
            type="text"
            placeholder="Buscar produto..."
            className="w-full border px-3 py-2 rounded-md mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  setSelectedProduct(prod);
                  setOpenProductModal(true);
                }}
                className="border rounded-lg p-2 shadow-sm cursor-pointer hover:bg-gray-50"
              >
                <div className="h-24 bg-gray-200 rounded mb-2 overflow-hidden">
                  {prod.imageUrl && (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <p className="font-medium truncate">{prod.name}</p>
                <p className="text-sm text-gray-600">
                  R$ {Number(prod.price).toFixed(2).replace(".", ",")}
                </p>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <p className="text-gray-500 text-sm col-span-3 text-center">
                Nenhum produto encontrado
              </p>
            )}
          </div>
        </div>

        {/* DIREITA */}
        <div className="p-4 overflow-y-auto pb-24">
          {/* botão criar */}
          <div className="sticky bottom-0 bg-white py-3 border-t">
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-4 py-3 rounded-md w-full text-lg font-semibold"
            >
              Criar pedido
            </button>
          </div>
        </div>
      </div>

      <ModalSelecionarComplementos
        open={openProductModal}
        product={selectedProduct}
        onClose={() => {
          setOpenProductModal(false);
          setSelectedProduct(null);
        }}
        onAdd={(item: any) => setItems((prev) => [...prev, item])}
      />
    </div>
  );
}
