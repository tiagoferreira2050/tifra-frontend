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

  useEffect(() => {
    if (!open || !product) return;
    setSelected({});
    setQty(1);
  }, [open, product]);

  if (!open || !product) return null;

  const groups = product.complementItems ?? [];

  // ============================
  // TOGGLE / ADDABLE
  // ============================
  function toggleOption(group: any, option: any) {
    setSelected((prev) => {
      const current = prev[group.id] ?? {};

      // 🔘 SINGLE
      if (group.type === "single") {
        return {
          ...prev,
          [group.id]: { [option.id]: 1 },
        };
      }

      // ☑️ MULTIPLE
      if (group.type === "multiple") {
        if (current[option.id]) {
          const copy = { ...current };
          delete copy[option.id];
          return { ...prev, [group.id]: copy };
        }

        if (
          group.maxChoose &&
          Object.keys(current).length >= group.maxChoose
        ) {
          return prev;
        }

        return {
          ...prev,
          [group.id]: { ...current, [option.id]: 1 },
        };
      }

      // ➕ ADDABLE
      const qty = current[option.id] ?? 0;
      return {
        ...prev,
        [group.id]: { ...current, [option.id]: qty + 1 },
      };
    });
  }

  function changeAddableQty(groupId: string, optionId: string, delta: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? {};
      const newQty = (current[optionId] ?? 0) + delta;

      if (newQty <= 0) {
        const copy = { ...current };
        delete copy[optionId];
        return { ...prev, [groupId]: copy };
      }

      return {
        ...prev,
        [groupId]: { ...current, [optionId]: newQty },
      };
    });
  }

  // ============================
  // VALIDAÇÃO
  // ============================
  function isValid() {
    return groups.every((g: any) => {
      const chosen = selected[g.id] ?? {};
      const count = Object.keys(chosen).length;

      if (g.required && count === 0) return false;
      if (g.minChoose && count < g.minChoose) return false;

      return true;
    });
  }

  // ============================
  // PREÇO
  // ============================
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

  // ============================
  // FORMATAR
  // ============================
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

  // ============================
  // UI
  // ============================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[620px] max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.categoryName}</p>
          </div>
          <button onClick={onClose}><X /></button>
        </div>

        {groups.map((group: any) => {
          const chosen = selected[group.id] ?? {};
          return (
            <div key={group.id} className="border rounded p-3 mb-4">
              <p className="font-medium mb-2">
                {group.title}
                {group.required && <span className="text-red-500"> *</span>}
              </p>

              {group.options.map((opt: any) => {
                const q = chosen[opt.id] ?? 0;

                return (
                  <div key={opt.id} className="flex justify-between items-center mb-2">
                    <span>{opt.name}</span>

                    {group.type === "addable" ? (
                      <div className="flex gap-2 items-center">
                        <button onClick={() => changeAddableQty(group.id, opt.id, -1)}>-</button>
                        <span>{q}</span>
                        <button onClick={() => toggleOption(group, opt)}>+</button>
                      </div>
                    ) : (
                      <input
                        type={group.type === "single" ? "radio" : "checkbox"}
                        checked={q > 0}
                        onChange={() => toggleOption(group, opt)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        <p className="font-bold mb-4">
          Total: R$ {finalPrice.toFixed(2).replace(".", ",")}
        </p>

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
