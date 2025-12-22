"use client";

import React, { useEffect } from "react";

export default function OrderModal({
  order,
  onClose,
}: {
  order: any | null;
  onClose: () => void;
}) {
  if (!order) return null;

  // 🔑 Fecha com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 rounded-xl w-[420px] shadow-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-3">Comanda do Pedido</h2>

        {/* ================= DADOS ================= */}
        <div className="space-y-1 text-sm">
          <p><b>Pedido:</b> #{order.id}</p>
          <p><b>Cliente:</b> {order.customer}</p>
          <p><b>Telefone:</b> {order.phone || "-"}</p>
          <p><b>Endereço:</b> {order.address || "-"}</p>
          <p><b>Pagamento:</b> {order.paymentMethod || "-"}</p>
        </div>

        <p className="font-semibold mt-3">
          Total: R$ {order.total.toFixed(2).replace(".", ",")}
        </p>

        {/* ================= ITENS ================= */}
        <h3 className="font-semibold mt-4 mb-2">Itens:</h3>

        {order.items && order.items.length > 0 ? (
          <ul className="space-y-3 text-sm">
            {order.items.map((item: any, index: number) => (
              <li key={index} className="border rounded-md p-2">
                <div className="flex justify-between font-medium">
                  <span>
                    {item.quantity}x {item.product?.name || "Produto"}
                  </span>
                  <span>
                    R$ {(item.unitPrice * item.quantity)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>

                {/* COMPLEMENTOS */}
                {Array.isArray(item.complements) && item.complements.length > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-xs text-gray-600">
                    {item.complements.map((comp: any, i: number) => (
                      <li key={i}>
                        {comp.name}
                        {comp.price > 0 &&
                          ` (+R$ ${comp.price
                            .toFixed(2)
                            .replace(".", ",")})`}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum item</p>
        )}

        <button
          onClick={onClose}
          className="mt-5 bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded w-full"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
