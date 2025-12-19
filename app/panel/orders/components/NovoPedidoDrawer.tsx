"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { generateOrderId } from "../utils/orderId";
import { dbLoadAll } from "../../cardapio/storage/db";
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

  // 🔥 Carrega produtos do banco
  useEffect(() => {
  if (!open) return;

  let mounted = true;

  async function loadProducts() {
    try {
      const storeId = localStorage.getItem("storeId");

      if (!storeId) {
        console.error("storeId não encontrado");
        setAllProducts([]);
        return;
      }

      const res = await fetch(
        `/api/products/pdv?storeId=${storeId}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        console.error("Erro ao buscar produtos PDV");
        setAllProducts([]);
        return;
      }

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
}, [open]);


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

  // 🔥 CEP automático
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
          setCepLoading(false);
          return;
        }

        const data = await res.json();

        if (data.erro) {
          setCepError("CEP não encontrado");
          setCepLoading(false);
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

  // 🔥 Criar pedido
async function handleCreate() {
  if (!customer.trim()) {
    alert("Digite o nome do cliente");
    return;
  }

  const storeId = localStorage.getItem("storeId");

  if (!storeId) {
    alert("StoreId não encontrado. Faça login novamente.");
    return;
  }

  const total =
    items.reduce(
      (acc, v) => acc + Number(v.price) * v.qty,
      0
    ) +
    (deliveryType === "entrega" ? toNumber(deliveryFee) : 0);

  const payload = {
    storeId,

    customer: {
      name: customer,
      phone,
      address:
        deliveryType === "entrega"
          ? `${street}, ${number}${
              complement ? " - " + complement : ""
            } - ${neighborhood} - ${city} - ${stateUf} (CEP: ${cep})`
          : null,
    },

    items: items.map((it: any) => ({
      productId: it.productId,
      quantity: it.qty,
      unitPrice: it.price,
      complements: it.complements || [],
    })),

    paymentMethod,
    deliveryFee: deliveryType === "entrega" ? toNumber(deliveryFee) : 0,
    total,
  };

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Erro ao criar pedido no servidor");
      return;
    }

    const savedOrder = await res.json();

    if (onCreate) onCreate(savedOrder);

    onClose();
    setCustomer("");
    setPhone("");
    setItems([]);
    setDeliveryType("entrega");
  } catch (err) {
    console.error("Erro ao salvar pedido:", err);
    alert("Falha ao salvar pedido no servidor.");
  }
}



  // ────────────────────────────────────────────────
  // UI PRINCIPAL
  // ────────────────────────────────────────────────
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl border-l 
        transition-all duration-300 z-50
        ${open ? "w-[70%] opacity-100" : "w-0 opacity-0 pointer-events-none"}
      `}
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
            {filteredProducts.map((prod: any) => (
              <div
  key={prod.id}
  onClick={() => {
    console.log("PROD SELECIONADO >>>", prod);

    const complementItems = prod.complements || [];

    setSelectedProduct({
      ...prod,
      complementItems,
    });

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

  <p className="text-xs text-gray-400">{prod.categoryName}</p>
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
          {/* TIPO DE ENTREGA */}
          <div className="flex gap-2 mb-4">
            {["entrega", "retirada", "balcao"].map((type) => (
              <button
                key={type}
                onClick={() => setDeliveryType(type)}
                className={`
                  px-3 py-1.5 rounded-md text-sm border 
                  ${deliveryType === type ? "bg-red-600 text-white" : "bg-white"}
                `}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <p className="font-medium text-gray-700 mb-2">Dados do cliente</p>

          <input
            type="text"
            placeholder="Nome do cliente"
            className="w-full border px-3 py-2 rounded-md mb-3"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />

          <input
            type="text"
            placeholder="Telefone"
            className="w-full border px-3 py-2 rounded-md mb-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* ENDEREÇO */}
          {deliveryType === "entrega" && (
            <div className="mb-4 border rounded-md p-3">
              <p className="font-semibold mb-2">Endereço de entrega</p>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-gray-600">CEP</label>
                  <input
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full border px-2 py-1 rounded mt-1"
                  />
                  {cepLoading && (
                    <div className="text-xs text-gray-500">Consultando CEP...</div>
                  )}
                  {cepError && (
                    <div className="text-xs text-red-600">{cepError}</div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-600">Número</label>
                  <input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Número"
                    className="w-full border px-2 py-1 rounded mt-1"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="text-xs text-gray-600">Rua</label>
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua"
                  className="w-full border px-2 py-1 rounded mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-gray-600">Bairro</label>
                  <input
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    className="w-full border px-2 py-1 rounded mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Cidade</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    className="w-full border px-2 py-1 rounded mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-gray-600">Estado (UF)</label>
                  <input
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value)}
                    placeholder="UF"
                    className="w-full border px-2 py-1 rounded mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Complemento</label>
                  <input
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto, bloco..."
                    className="w-full border px-2 py-1 rounded mt-1"
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs text-gray-600">Taxa de entrega</label>
                <input
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(formatCurrency(e.target.value))}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
              </div>
            </div>
          )}

          {/* PAGAMENTO */}
          <div className="mb-4 border rounded-md p-3">
            <p className="font-semibold mb-2">Pagamento</p>

            <div className="flex gap-2 mb-2">
              {[
                { id: "dinheiro", label: "Dinheiro" },
                { id: "cartao", label: "Cartão" },
                { id: "pix", label: "PIX" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`
                    px-3 py-1 rounded-md text-sm border 
                    ${
                      paymentMethod === m.id
                        ? "bg-red-600 text-white"
                        : "bg-white"
                    }
                  `}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* ITENS */}
          {items.length > 0 && (
            <div className="mb-4 border rounded-md p-3">
              <p className="font-semibold mb-2">Produtos selecionados</p>

              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">{it.categoryName}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      R${" "}
                      {(it.price * it.qty)
                        .toFixed(2)
                        .replace(".", ",")}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((p) =>
                              p.id === it.id
                                ? { ...p, qty: Math.max(1, p.qty - 1) }
                                : p
                            )
                          )
                        }
                      >
                        -
                      </button>

                      <div className="px-2">{it.qty}</div>

                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((p) =>
                              p.id === it.id
                                ? { ...p, qty: p.qty + 1 }
                                : p
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="ml-2 text-red-600"
                      onClick={() =>
                        setItems((prev) =>
                          prev.filter((p) => p.id !== it.id)
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}

              <p className="text-right font-bold mt-2">
                Total: R$
                {(
                  items.reduce(
                    (acc, v) => acc + Number(v.price) * v.qty,
                    0
                  ) +
                  (deliveryType === "entrega"
                    ? toNumber(deliveryFee)
                    : 0)
                )
                  .toFixed(2)
                  .replace(".", ",")}
              </p>
            </div>
          )}

          {/* BOTÃO CRIAR */}
          <div className="sticky bottom-0 left-0 bg-white py-3 border-t mt-4">
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-4 py-3 rounded-md w-full text-lg font-semibold"
            >
              Criar pedido
            </button>
          </div>
        </div>
      </div>

      {/* MODAL COMPLEMENTOS */}
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
