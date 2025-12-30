"use client";

import { useEffect, useState } from "react";

/* =======================
   TIPOS (IGUAL PUBLIC ROUTE)
======================= */
type ComplementOption = {
  id: string;
  name: string;
  price: number;
};

type ComplementGroup = {
  id: string;
  title: string;
  type: "single" | "multiple" | "addable";
  required: boolean;
  minChoose: number;
  maxChoose: number | null;
  options: ComplementOption[];
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  complementItems: ComplementGroup[];
};

interface Props {
  open: boolean;
  productId: string | null;
  onClose: () => void;
}

export default function ProductModal({
  open,
  productId,
  onClose,
}: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  /* =======================
     LOAD PRODUTO + COMPLEMENTOS
  ======================= */
  useEffect(() => {
    if (!open || !productId) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL não definida");
      return;
    }

    setLoading(true);
    setProduct(null);

    fetch(`${API_URL}/api/public/products/${productId}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar produto público");
        return res.json();
      })
      .then((data) => {
        console.log("✅ PRODUTO:", data);
        console.log("✅ COMPLEMENTOS:", data.complementItems);
        setProduct(data);
      })
      .catch((err) => {
        console.error("❌ ERRO MODAL:", err);
      })
      .finally(() => setLoading(false));
  }, [open, productId]);

  /* =======================
     CONTROLE DE ABERTURA
  ======================= */
  if (!open) return null;

  /* =======================
     LOADING
  ======================= */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white px-6 py-4 rounded">
          Carregando produto…
        </div>
      </div>
    );
  }

  if (!product) return null;

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[600px] rounded-xl p-6 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* PREÇO */}
        <p className="font-semibold mb-4">
          R$ {product.price.toFixed(2).replace(".", ",")}
        </p>

        {/* DEBUG */}
        <div className="text-xs bg-gray-100 p-2 rounded mb-4">
          Grupos encontrados: {product.complementItems.length}
        </div>

        {/* SEM COMPLEMENTOS */}
        {product.complementItems.length === 0 && (
          <div className="text-center text-red-500 text-sm">
            ❌ Produto sem complementos vinculados
          </div>
        )}

        {/* COMPLEMENTOS (IGUAL GESTOR) */}
        {product.complementItems.map((group) => (
          <div key={group.id} className="border rounded p-3 mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">
                {group.title}
                {group.required && (
                  <span className="text-red-500"> *</span>
                )}
              </span>

              {group.maxChoose !== null && (
                <span className="text-xs text-gray-500">
                  até {group.maxChoose}
                </span>
              )}
            </div>

            {group.options.map((opt) => (
              <div
                key={opt.id}
                className="flex justify-between text-sm py-1"
              >
                <span>{opt.name}</span>
                <span className="text-gray-500">
                  R$ {opt.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-purple-600 text-white py-2 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
