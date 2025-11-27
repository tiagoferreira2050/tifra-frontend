'use client';

import React from "react";
import { Order } from "../services/orderService";

export default function OrderModal({ order, onClose }: {
  order: Order | null;
  onClose: () => void;
}) {

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Comanda do Pedido</h2>

        <p><b>Código:</b> {order.code}</p>
        <p><b>Cliente:</b> {order.customerName}</p>
        <p><b>Telefone:</b> {order.phone}</p>
        <p><b>Endereço:</b> {order.fullAddress}</p>
        <p><b>Pagamento:</b> {order.paymentMethod}</p>
        <p><b>Total:</b> R$ {order.total.toFixed(2)}</p>

        <h3 className="font-semibold mt-3">Itens:</h3>
        <ul className="list-disc ml-4">
          {order.items?.map((item, i) => (
            <li key={i}>{item.qty}x {item.name}</li>
          ))}
        </ul>

        <button 
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
