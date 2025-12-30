"use client";

import { useEffect, useState } from "react";

/* =======================
   TIPOS
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
  required?: boolean;
  minChoose?: number;
  maxChoose?: number;
  options: ComplementOption[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  complementItems?: ComplementGroup[];
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/* =======================
   COMPONENT
======================= */
export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<
    Record<string, Record<string, number>>
  >({});

  /* =======================
     LOAD PRODUTO
  ======================= */
  useEffect(() => {
    if (!product?.id) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) return;

    setLoading(true);

    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/public/products/${product.id}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        console.log("🔥 PRODUTO PÚBLICO RECEBIDO:", data);
        console.log("🔥 COMPLEMENT ITEMS:", data?.complementItems);

        setFullProduct(data);
      } catch (err) {
        console.error("Erro ao carregar produto público", err);
        setFullProduct(product);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [product?.id]);

  if (!product) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl px-6 py-4">
          Carregando opções...
        </div>
      </div>
    );
  }

  const productData = fullProduct || product;
  const groups = productData.complementItems ?? [];

  /* =======================
     DEBUG VISUAL
  ======================= */
  if (groups.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md text-center">
          <h2 className="font-bold mb-2">⚠️ Sem complementos</h2>
          <p className="text-sm text-gray-600 mb-3">
            O produto foi carregado, mas não possui grupos vinculados.
          </p>

          <pre className="text-xs text-left bg-gray-100 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(productData, null, 2)}
          </pre>

          <button
            onClick={onClose}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  /* =======================
     HELPERS
  ======================= */
  function toggleOption(group: ComplementGroup, option: ComplementOption) {
    setSelected(prev => {
      const current = prev[group.id] ?? {};
      return {
        ...prev,
        [group.id]: {
          ...current,
          [option.id]: (current[option.id] ?? 0) + 1,
        },
      };
    });
  }

  /* =======================
     RENDER NORMAL
  ======================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-xl font-semibold">{productData.name}</h2>

          <div className="mt-4">
            {groups.map(group => (
              <div key={group.id} className="border rounded p-3 mb-4">
                <p className="font-medium mb-2">{group.title}</p>

                {group.options.map(opt => (
                  <div
                    key={opt.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>{opt.name}</span>
                    <button
                      onClick={() => toggleOption(group, opt)}
                      className="border px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-3 rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
