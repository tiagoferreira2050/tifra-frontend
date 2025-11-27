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
  const [selected, setSelected] = useState<any>({});

  // =====================================================
  // 🔥 RESET QUANDO ABRIR MODAL
  // =====================================================
  useEffect(() => {
    if (!open || !product) return;
    setSelected({});
    setQty(1);
  }, [open, product]);

  if (!open || !product) return null;

  const groups = product.complementItems ?? [];

  // =====================================================
  // 🔥 LÓGICA DE SELEÇÃO
  // =====================================================
  const toggleOption = (groupId: string, option: any, type: string) => {
    const group = groups.find((g: any) => g.id === groupId);
    const max = group?.maxChoose || null;
    const current = selected[groupId] || [];

    if (
      max &&
      current.length >= max &&
      !current.includes(option.id) &&
      type !== "single"
    ) {
      return;
    }

    setSelected((prev: any) => {
      const arr = prev[groupId] || [];

      if (type === "single") {
        return { ...prev, [groupId]: [option.id] };
      }

      if (arr.includes(option.id)) {
        return {
          ...prev,
          // 🔥 **CORREÇÃO AQUI**
          [groupId]: arr.filter((id: string) => id !== option.id),
        };
      }

      return {
        ...prev,
        [groupId]: [...arr, option.id],
      };
    });
  };

  // =====================================================
  // 🔥 TOTAL DO PRODUTO
  // =====================================================
  const basePrice = product.discount
    ? Number(product.discount.price)
    : Number(product.price);

  const totalComplements = groups.reduce((acc: number, g: any) => {
    const opts = g.options || [];
    const chosen = selected[g.id] || [];

    return (
      acc +
      chosen.reduce((sum: number, optionId: string) => {
        const opt = opts.find((o: any) => o.id === optionId);
        return sum + Number(opt?.price || 0);
      }, 0)
    );
  }, 0);

  const finalPrice = (basePrice + totalComplements) * qty;

  // =====================================================
  // 🔥 INTERFACE
  // =====================================================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[620px] max-height-[90vh] overflow-y-auto shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.categoryName}</p>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X />
          </button>
        </div>

        {/* LISTA DE COMPLEMENTOS */}
        {groups.length === 0 && (
          <p className="text-gray-500 text-center mb-4">
            Este produto não possui complementos configurados.
          </p>
        )}

        {groups.map((group: any) => {
          const type = group.type;
          const chosen = selected[group.id] || [];
          const opts = group.options || [];
          const max = group.maxChoose;

          return (
            <div key={group.id} className="border rounded-md p-3 mb-4">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">
                  {group.title}
                  {group.required && (
                    <span className="text-red-600 text-xs"> (obrigatório)</span>
                  )}
                </p>

                {max && (
                  <p className="text-xs text-gray-500">
                    até {max} opção{max > 1 ? "es" : ""}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {opts.map((opt: any) => {
                  const isChecked = chosen.includes(opt.id);
                  const disabled =
                    max &&
                    chosen.length >= max &&
                    !isChecked &&
                    type !== "single";

                  return (
                    <label
                      key={opt.id}
                      className={`flex justify-between items-center border p-2 rounded cursor-pointer transition-opacity
                        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {type === "single" ? (
                          <input
                            type="radio"
                            checked={isChecked}
                            onChange={() =>
                              toggleOption(group.id, opt, type)
                            }
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={disabled}
                            onChange={() =>
                              toggleOption(group.id, opt, type)
                            }
                          />
                        )}

                        <span>{opt.name}</span>
                      </div>

                      {opt.price > 0 && (
                        <span className="text-sm text-gray-700">
                          + R$ {opt.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* QUANTIDADE */}
        <div className="flex items-center gap-4 my-4">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <span>{qty}</span>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>

        {/* TOTAL */}
        <p className="text-xl font-bold mb-4">
          Total: R$ {finalPrice.toFixed(2).replace(".", ",")}
        </p>

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onAdd({
                id: product.id + "-" + Date.now(),
                productId: product.id,
                name: product.name,
                price: basePrice + totalComplements,
                qty,
                complements: selected,
                categoryName: product.categoryName,
              });
              onClose();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Adicionar ao pedido
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
