"use client";

import React, { useEffect } from "react";

type OrderModalType = {
  id: string;
  customer: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  total: number;
  items?: { qty: number; name: string }[];
};

export default function OrderModal({
  order,
  onClose,
}: {
  order: OrderModalType | null;
  onClose: () => void;
}) {
  // 🔒 Não renderiza se não houver pedido
  if (!order) return null;

  // 🔑 Fecha com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose} // clique fora fecha
    >
      <div
        className="bg-white p-5 rounded-xl w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro
      >
        <h2 className="text-xl font-bold mb-3">Comanda do Pedido</h2>

        <div className="space-y-1 text-sm">
          <p>
            <b>Pedido:</b> #{order.id}
          </p>
          <p>
            <b>Cliente:</b> {order.customer}
          </p>
          <p>
            <b>Telefone:</b> {order.phone || "-"}
          </p>
          <p>
            <b>Endereço:</b> {order.address || "-"}
          </p>
          <p>
            <b>Pagamento:</b> {order.paymentMethod || "-"}
          </p>
        </div>

        <p className="font-semibold mt-3">
          Total: R$ {order.total.toFixed(2).replace(".", ",")}
        </p>

        <h3 className="font-semibold mt-4">Itens:</h3>
        <ul className="list-disc ml-4 text-sm max-h-40 overflow-auto">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, i) => (
              <li key={i}>
                {item.qty}x {item.name}
              </li>
            ))
          ) : (
            <li>Nenhum item</li>
          )}
        </ul>

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
