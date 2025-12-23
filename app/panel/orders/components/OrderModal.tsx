"use client";

import React, { useEffect, useState } from "react";

type Complement = {
  name?: string;
  optionName?: string;
  label?: string;
  price?: number;
  quantity?: number;
  qty?: number;
};

type OrderItem = {
  quantity: number;
  unitPrice: number;
  product?: {
    name: string;
  };
  complements?: Complement[];
};

type OrderModalType = {
  id: string;
  customer: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  total: number;
  items?: OrderItem[];
};

export default function OrderModal({
  order,
  onClose,
}: {
  order: OrderModalType | null;
  onClose: () => void;
}) {
  // 🔒 NOVO (não interfere em nada existente)
  const [openCancelModal, setOpenCancelModal] = useState(false);

  if (!order) return null;

  // Fecha com ESC
 useEffect(() => {
  if (!order) return;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [order, onClose]);


  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[420px] max-h-[85vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Comanda do Pedido</h2>

        {/* ================= DADOS DO PEDIDO ================= */}
        <div className="space-y-1 text-sm mb-3">
          <p><b>Pedido:</b> #{order.id}</p>
          <p><b>Cliente:</b> {order.customer}</p>
          <p><b>Telefone:</b> {order.phone || "-"}</p>
          <p><b>Endereço:</b> {order.address || "-"}</p>
          <p><b>Pagamento:</b> {order.paymentMethod || "-"}</p>
        </div>

        <p className="font-semibold mb-4">
          Total: R$ {order.total.toFixed(2).replace(".", ",")}
        </p>

        {/* ================= ITENS ================= */}
        <h3 className="font-semibold mb-2">Itens:</h3>

        <div className="space-y-3">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 text-sm">
                <div className="flex justify-between font-medium">
                  <span>
                    {item.quantity}x {item.product?.name || "Produto"}
                  </span>
                  <span>
                    R${" "}
                    {(item.unitPrice * item.quantity)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>

                {item.complements && item.complements.length > 0 && (
                  <ul className="mt-2 ml-4 list-disc text-gray-600">
                    {item.complements.map((comp, i) => {
                      const name =
                        comp.name ||
                        comp.optionName ||
                        comp.label ||
                        "Complemento";

                      const qty =
                        comp.quantity ??
                        comp.qty ??
                        1;

                      const price =
                        typeof comp.price === "number"
                          ? comp.price
                          : 0;

                      return (
                        <li key={i}>
                          {qty}x {name}
                          {price > 0 && (
                            <span className="text-gray-500">
                              {" "}
                              (+R${" "}
                              {price.toFixed(2).replace(".", ",")})
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum item</p>
          )}
        </div>

        {/* ================= AÇÕES ================= */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setOpenCancelModal(true)}
            className="flex-1 bg-red-600 text-white py-2 rounded"
          >
            Cancelar pedido
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 py-2 rounded"
          >
            Fechar
          </button>
        </div>

        {/* 🔒 PLACEHOLDER SEGURO (não renderiza nada) */}
        {openCancelModal && null}
      </div>
    </div>
  );
}
