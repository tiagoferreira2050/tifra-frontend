"use client";

import React from "react";
import OrderCard from "./OrderCard";

/* 🔒 Tipo padronizado com OrderBoard / backend */
export type Order = {
  id: string;
  customer: string;
  status: string;
  total: number;

  phone?: string;
  deliveryType?: string;
  address?: string;
  shortAddress?: string;
  createdAt: string;
  items?: any[];
  paymentMethod?: string;
  deliveryFee?: number;
};

interface Props {
  title: string;
  color: string;
  count: number;
  orders: Order[];
  footerValue?: number;

  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onDispatch?: (id: string) => void;
  onFinish?: (id: string) => void;

  onToggleSelect: (id: string) => void;
  multiSelected: Record<string, boolean>;
  onOpen: (order: Order) => void;
}

export default function OrderColumn({
  title,
  color,
  count,
  orders,
  footerValue,
  onAccept,
  onReject,
  onDispatch,
  onFinish,
  onToggleSelect,
  multiSelected,
  onOpen,
}: Props) {
  return (
    <div className="flex flex-col">
      {/* HEADER DA COLUNA */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg flex items-center gap-2">
          {title}

          {footerValue !== undefined && (
            <span className="text-green-700 font-semibold text-sm">
              – R$ {footerValue.toFixed(2).replace(".", ",")}
            </span>
          )}
        </h2>

        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
          {count}
        </span>
      </div>

      {/* LISTA DE PEDIDOS */}
      <div
        className={`border-2 ${color} rounded-xl p-3 flex flex-col gap-3 min-h-[120px]`}
      >
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              selected={!!multiSelected[order.id]}
              onToggle={() => onToggleSelect(order.id)}
              onAccept={onAccept ? () => onAccept(order.id) : undefined}
              onReject={onReject ? () => onReject(order.id) : undefined}
              onDispatch={onDispatch ? () => onDispatch(order.id) : undefined}
              onFinish={onFinish ? () => onFinish(order.id) : undefined}
              onOpen={() => onOpen(order)}
            />
          ))
        ) : (
          <div className="text-gray-500 text-sm text-center py-6">
            Nenhum pedido
          </div>
        )}
      </div>
    </div>
  );
}
