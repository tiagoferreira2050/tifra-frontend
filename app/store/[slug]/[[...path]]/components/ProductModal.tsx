"use client";


import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useCart } from "../../../../../src/contexts/CartContext";


/* =======================
   TIPOS (PUBLIC MENU)
======================= */
type ComplementOption = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

type ComplementGroup = {
  id: string;
  title: string;
  type: "single" | "multiple" | "addable";
  required?: boolean;
  minChoose?: number;
  maxChoose?: number | null;
  options: ComplementOption[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  complementItems?: ComplementGroup[];
};

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [qty, setQty] = useState(1);
  const [observation, setObservation] = useState("");

const { addItem } = useCart();

  // groupId -> optionId -> qty
  const [selected, setSelected] = useState<
    Record<string, Record<string, number>>
  >({});

  /* =======================
     LOAD PRODUTO COMPLETO
  ======================= */
  useEffect(() => {
    if (!product?.id) return;

    setLoading(true);
    setSelected({});
    setQty(1);
    setObservation("");

    apiFetch(`/api/public/menu/products/${product.id}`)
      .then((data) => {
        setFullProduct(data);
      })
      .catch(() => {
        setFullProduct(product);
      })
      .finally(() => setLoading(false));
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
     HELPERS
  ======================= */
  function getTotalSelected(groupId: string) {
    return Object.values(selected[groupId] ?? {}).reduce(
      (a, b) => a + b,
      0
    );
  }

  function toggleOption(group: ComplementGroup, option: ComplementOption) {
    setSelected((prev) => {
      const current = prev[group.id] ?? {};
      const total = getTotalSelected(group.id);

      // SINGLE
      if (group.type === "single") {
        return { ...prev, [group.id]: { [option.id]: 1 } };
      }

      // MULTIPLE
      if (group.type === "multiple") {
        if (current[option.id]) {
          const copy = { ...current };
          delete copy[option.id];
          return { ...prev, [group.id]: copy };
        }

        if (typeof group.maxChoose === "number" && total >= group.maxChoose) {
          return prev;
        }

        return {
          ...prev,
          [group.id]: { ...current, [option.id]: 1 },
        };
      }

      // ADDABLE
      if (typeof group.maxChoose === "number" && total >= group.maxChoose) {
        return prev;
      }

      return {
        ...prev,
        [group.id]: {
          ...current,
          [option.id]: (current[option.id] ?? 0) + 1,
        },
      };
    });
  }

  function changeAddableQty(
    group: ComplementGroup,
    option: ComplementOption,
    delta: number
  ) {
    setSelected((prev) => {
      const current = prev[group.id] ?? {};
      const next = (current[option.id] ?? 0) + delta;

      if (next <= 0) {
        const copy = { ...current };
        delete copy[option.id];
        return { ...prev, [group.id]: copy };
      }

      return {
        ...prev,
        [group.id]: { ...current, [option.id]: next },
      };
    });
  }

  function isValid() {
    return groups.every((g) => {
      const total = getTotalSelected(g.id);
      if (g.required && total === 0) return false;
      if (typeof g.minChoose === "number" && total < g.minChoose) return false;
      return true;
    });
  }

  /* =======================
     PREÇO
  ======================= */
  const basePrice = Number(productData.price);

  const complementsTotal = groups.reduce((acc, g) => {
    return (
      acc +
      Object.entries(selected[g.id] ?? {}).reduce((sum, [optId, q]) => {
        const opt = g.options.find((o) => o.id === optId);
        return sum + Number(opt?.price ?? 0) * q;
      }, 0)
    );
  }, 0);

  const finalPrice = (basePrice + complementsTotal) * qty;

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="relative">
          <img
            src={productData.imageUrl || "/placeholder.jpg"}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white rounded-full px-3 py-1"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-xl font-semibold">{productData.name}</h2>

          {productData.description && (
            <p className="text-sm text-gray-600 mt-2">
              {productData.description}
            </p>
          )}

          <div className="mt-3 font-semibold">
            R$ {basePrice.toFixed(2).replace(".", ",")}
          </div>

          {groups.length === 0 && (
            <p className="mt-6 text-sm text-gray-500 text-center">
              Este produto não possui adicionais
            </p>
          )}

          {groups.map((group) => (
            <div key={group.id} className="mt-6 border rounded-lg p-3">
              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  {group.title}
                  {group.required && (
                    <span className="text-red-500"> *</span>
                  )}
                </span>
                {typeof group.maxChoose === "number" && (
                  <span className="text-xs text-gray-500">
                    até {group.maxChoose}
                  </span>
                )}
              </div>

              {group.options.map((opt) => {
                const q = selected[group.id]?.[opt.id] ?? 0;

                return (
                  <div
                    key={opt.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <div className="flex items-center gap-3">
                      {opt.imageUrl ? (
                        <img
                          src={opt.imageUrl}
                          alt={opt.name}
                          className="w-12 h-12 rounded-lg object-cover border bg-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          +
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span>{opt.name}</span>
                        {opt.price > 0 && (
                          <span className="text-xs text-gray-500">
                            + R$ {opt.price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                    </div>

                    {group.type === "addable" ? (
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => changeAddableQty(group, opt, -1)}
                          className="border px-2 rounded"
                        >
                          −
                        </button>
                        <span>{q}</span>
                        <button
                          onClick={() => toggleOption(group, opt)}
                          className="border px-2 rounded"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <input
                        type={
                          group.type === "single" ? "radio" : "checkbox"
                        }
                        checked={q > 0}
                        onChange={() => toggleOption(group, opt)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* OBS */}
          <div className="mt-6">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full mt-2 border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <span>Quantidade</span>
            <div className="flex gap-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>


<button
  disabled={!isValid()}
  onClick={() => {
    addItem({
      id: `${productData.id}-${Date.now()}`,
      productId: productData.id,
      name: productData.name,
      qty,
      price: finalPrice,
      complements: selected,
    });

    onClose();
  }}
  className="w-full bg-purple-600 text-white py-3 rounded-xl disabled:opacity-50"
>
  Adicionar • R$ {finalPrice.toFixed(2).replace(".", ",")}
</button>
        </div>
      </div>
    </div>
  );
}
