"use client";

import { useCart } from "../../../../../src/contexts/CartContext";
import { Fragment } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

/* =======================
   HELPER: formatar complementos
======================= */
function renderComplements(
  complements?: Record<string, Record<string, number>>
) {
  if (!complements) return null;

  return Object.entries(complements).map(
    ([groupId, options]) => (
      <div key={groupId} className="mt-1 ml-2">
        {Object.entries(options).map(
          ([optionId, qty]) => (
            <p
              key={optionId}
              className="text-xs text-gray-500"
            >
              • {optionId}
              {qty > 1 ? ` x${qty}` : ""}
            </p>
          )
        )}
      </div>
    )
  );
}

export default function CartModal({ open, onClose }: Props) {
  const {
    items,
    updateQty,
    removeItem,
    total,
  } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full sm:w-[420px] bg-white h-full flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Sua sacola
          </h2>
          <button
            onClick={onClose}
            className="text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              Sua sacola está vazia 🛒
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3"
                >
                  {/* PRODUTO */}
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {item.name}
                      </p>

                      {/* COMPLEMENTOS */}
                      {renderComplements(item.complements)}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-xs"
                    >
                      Remover
                    </button>
                  </div>

                  {/* QTD + PREÇOS */}
                  <div className="flex justify-between items-center mt-3">
                    {/* QUANTIDADE */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(
                            item.id,
                            Math.max(1, item.qty - 1)
                          )
                        }
                        className="border px-2 rounded"
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(
                            item.id,
                            item.qty + 1
                          )
                        }
                        className="border px-2 rounded"
                      >
                        +
                      </button>
                    </div>

                    {/* PREÇO */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        R${" "}
                        {item.unitPrice
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                      <p className="font-semibold">
                        R${" "}
                        {(item.unitPrice * item.qty)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between font-semibold mb-4">
              <span>Total</span>
              <span>
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                // FUTURO: abrir checkout (endereço)
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
