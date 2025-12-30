"use client";

import { useEffect, useState } from "react";

/* =======================
   TIPOS (IGUAL BACKEND)
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

export default function ProductModal({
  product,
  onClose,
}: ProductModalProps) {
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [qty, setQty] = useState(1);
  const [observation, setObservation] = useState("");

  // groupId -> optionId -> qty
  const [selected, setSelected] = useState<
    Record<string, Record<string, number>>
  >({});

  /* =======================
     LOAD PRODUTO COMPLETO
     🔥 ROTA REAL (GESTOR)
  ======================= */
  useEffect(() => {
    if (!product?.id) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL não definida");
      return;
    }

    setLoading(true);
    setSelected({});
    setQty(1);
    setObservation("");

    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/products/${product.id}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Erro ao buscar produto");
        }

        const data = await res.json();

        console.log("✅ PRODUTO COMPLETO:", data);
        console.log("✅ COMPLEMENTOS:", data.complementItems);

        setFullProduct(data);
      } catch (err) {
        console.error("❌ Erro ao carregar produto", err);
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
     HELPERS (IGUAL GESTOR)
  ======================= */
  function getTotalSelected(groupId: string) {
    const g = selected[groupId] ?? {};
    return Object.values(g).reduce((acc, v) => acc + v, 0);
  }

  function toggleOption(
    group: ComplementGroup,
    option: ComplementOption
  ) {
    setSelected((prev) => {
      const current = prev[group.id] ?? {};
      const totalSelected = getTotalSelected(group.id);

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

        if (
          typeof group.maxChoose === "number" &&
          totalSelected >= group.maxChoose
        ) {
          return prev;
        }

        return {
          ...prev,
          [group.id]: { ...current, [option.id]: 1 },
        };
      }

      // ADDABLE
      if (
        typeof group.maxChoose === "number" &&
        totalSelected >= group.maxChoose
      ) {
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

  function isValid() {
    return groups.every((g) => {
      const chosen = selected[g.id] ?? {};
      const total = Object.values(chosen).reduce(
        (a, b) => a + b,
        0
      );

      if (g.required && total === 0) return false;
      if (
        typeof g.minChoose === "number" &&
        total < g.minChoose
      )
        return false;

      return true;
    });
  }

  /* =======================
     PREÇO
  ======================= */
  const basePrice = Number(productData.price);

  const complementsTotal = groups.reduce((acc, g) => {
    const chosen = selected[g.id] ?? {};
    return (
      acc +
      Object.entries(chosen).reduce((sum, [optId, q]) => {
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
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {productData.name}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="font-semibold mb-3">
            R$ {basePrice.toFixed(2)}
          </div>

          {/* COMPLEMENTOS */}
          {groups.map((group) => {
            const chosen = selected[group.id] ?? {};
            const totalSelected = getTotalSelected(group.id);

            return (
              <div
                key={group.id}
                className="border rounded-lg p-3 mb-4"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {group.title}
                    {group.required && (
                      <span className="text-red-500"> *</span>
                    )}
                  </span>
                  {group.maxChoose && (
                    <span className="text-xs text-gray-500">
                      até {group.maxChoose}
                    </span>
                  )}
                </div>

                {group.options.map((opt) => {
                  const q = chosen[opt.id] ?? 0;
                  const disabled =
                    group.maxChoose &&
                    totalSelected >= group.maxChoose &&
                    q === 0;

                  return (
                    <div
                      key={opt.id}
                      className={`flex justify-between items-center mb-2 ${
                        disabled ? "opacity-40" : ""
                      }`}
                    >
                      <div>
                        {opt.name}
                        {opt.price > 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            + R$ {opt.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <input
                        type={
                          group.type === "single"
                            ? "radio"
                            : "checkbox"
                        }
                        checked={q > 0}
                        disabled={disabled}
                        onChange={() =>
                          toggleOption(group, opt)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* OBSERVAÇÃO */}
          <div className="mt-4">
            <label className="text-sm font-medium">
              Observações
            </label>
            <textarea
              value={observation}
              onChange={(e) =>
                setObservation(e.target.value)
              }
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
              <button onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          <button
            disabled={!isValid()}
            className="w-full bg-purple-600 text-white py-3 rounded-xl disabled:opacity-50"
          >
            Adicionar • R$ {finalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
