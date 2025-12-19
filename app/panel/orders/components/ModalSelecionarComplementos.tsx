"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ModalSelecionarComplementos({
  open,
  product,
  onClose,
  onAdd,
}: any) {
  const [qty, setQty] = useState(1);

  // groupId -> { optionId: qty }
  const [selected, setSelected] = useState<
    Record<string, Record<string, number>>
  >({});

  // ======================================
  // RESET AO ABRIR
  // ======================================
  useEffect(() => {
    if (!open || !product) return;
    setSelected({});
    setQty(1);
  }, [open, product]);

  if (!open || !product) return null;

  const groups = product.complementItems ?? [];

  // ======================================
  // HELPERS
  // ======================================
  function getTotalSelected(groupId: string) {
    const g = selected[groupId] ?? {};
    return Object.values(g).reduce((acc, v) => acc + v, 0);
  }

  // ======================================
  // TOGGLE / ADDABLE
  // ======================================
  function toggleOption(group: any, option: any) {
    setSelected((prev) => {
      const current = prev[group.id] ?? {};
      const totalSelected = getTotalSelected(group.id);

      // 🔘 SINGLE
      if (group.type === "single") {
        return {
          ...prev,
          [group.id]: { [option.id]: 1 },
        };
      }

      // ☑️ MULTIPLE
      if (group.type === "multiple") {
        // remove
        if (current[option.id]) {
          const copy = { ...current };
          delete copy[option.id];
          return { ...prev, [group.id]: copy };
        }

        // bloqueia maxChoose
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

      // ➕ ADDABLE
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

  function changeAddableQty(
    group: any,
    option: any,
    delta: number
  ) {
    setSelected((prev) => {
      const current = prev[group.id] ?? {};
      const currentQty = current[option.id] ?? 0;
      const totalSelected = getTotalSelected(group.id);

      if (delta > 0) {
        if (
          typeof group.maxChoose === "number" &&
          totalSelected >= group.maxChoose
        ) {
          return prev;
        }
      }

      const newQty = currentQty + delta;

      if (newQty <= 0) {
        const copy = { ...current };
        delete copy[option.id];
        return { ...prev, [group.id]: copy };
      }

      return {
        ...prev,
        [group.id]: { ...current, [option.id]: newQty },
      };
    });
  }

  // ======================================
  // VALIDAÇÃO (min / required)
  // ======================================
  function isValid() {
    return groups.every((g: any) => {
      const chosen = selected[g.id] ?? {};
      const total = Object.values(chosen).reduce(
        (acc, v) => acc + v,
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

  // ======================================
  // PREÇO
  // ======================================
  const basePrice = Number(product.price);

  const complementsTotal = groups.reduce((acc: number, g: any) => {
    const chosen = selected[g.id] ?? {};
    const opts = g.options ?? [];

    return (
      acc +
      Object.entries(chosen).reduce((sum, [optId, q]) => {
        const opt = opts.find((o: any) => o.id === optId);
        return sum + Number(opt?.price ?? 0) * q;
      }, 0)
    );
  }, 0);

  const finalPrice = (basePrice + complementsTotal) * qty;

  // ======================================
  // FORMATAR PARA O PEDIDO (SEM QUEBRAR)
  // ======================================
  const complementsFormatted = groups.flatMap((g: any) => {
    const chosen = selected[g.id] ?? {};
    const opts = g.options ?? [];

    return Object.entries(chosen).map(([optId, q]) => {
      const opt = opts.find((o: any) => o.id === optId);
      return {
        groupId: g.id,
        groupTitle: g.title,
        optionId: opt.id,
        optionName: opt.name,
        qty: q,
        price: Number(opt.price ?? 0),
      };
    });
  });

  // ======================================
  // UI
  // ======================================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[620px] max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">
              {product.categoryName}
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* COMPLEMENTOS */}
        {groups.map((group: any) => {
          const chosen = selected[group.id] ?? {};
          const totalSelected = getTotalSelected(group.id);

          return (
            <div key={group.id} className="border rounded p-3 mb-4">
              <div className="flex justify-between mb-2">
                <p className="font-medium">
                  {group.title}
                  {group.required && (
                    <span className="text-red-500"> *</span>
                  )}
                </p>
                {typeof group.maxChoose === "number" && (
                  <span className="text-xs text-gray-500">
                    até {group.maxChoose}
                  </span>
                )}
              </div>

              {group.options.map((opt: any) => {
                const q = chosen[opt.id] ?? 0;
                const disabled =
                  typeof group.maxChoose === "number" &&
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
                      <span>{opt.name}</span>
                      {opt.price > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          + R$ {opt.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>

                    {group.type === "addable" ? (
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() =>
                            changeAddableQty(group, opt, -1)
                          }
                          className="px-2 border rounded"
                        >
                          -
                        </button>
                        <span>{q}</span>
                        <button
                          onClick={() => toggleOption(group, opt)}
                          className="px-2 border rounded"
                        >
                          +
                        </button>
                      </div>
                    ) : (
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
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* TOTAL */}
        <p className="font-bold mb-4">
          Total: R$ {finalPrice.toFixed(2).replace(".", ",")}
        </p>

        {/* AÇÃO */}
        <button
          disabled={!isValid()}
          onClick={() => {
            onAdd({
              id: `${product.id}-${Date.now()}`,
              productId: product.id,
              name: product.name,
              price: basePrice + complementsTotal,
              qty,
              complements: complementsFormatted,
              categoryName: product.categoryName,
            });
            onClose();
          }}
          className="bg-green-600 text-white w-full py-2 rounded disabled:opacity-50"
        >
          Adicionar ao pedido
        </button>
      </div>
    </div>
  );
}
