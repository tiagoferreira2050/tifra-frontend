'use client';

import React from 'react';
import OrderCard from './OrderCard';

/* 🔥 Mesmo tipo seguro usado no OrderBoard e OrderCard */
type Order = {
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
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg flex items-center gap-2">
          {title}

          {footerValue !== undefined && (
            <span className="text-green-700 font-semibold">
              – R$ {footerValue.toFixed(2)}
            </span>
          )}
        </h2>

        <span className="text-sm bg-gray-200 px-2 py-0.5 rounded">{count}</span>
      </div>

      <div className={`border-2 ${color} rounded-xl p-3 flex flex-col gap-3`}>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            selected={multiSelected[order.id] ?? false}
            onToggle={() => onToggleSelect(order.id)}
            onAccept={onAccept ? () => onAccept(order.id) : undefined}
            onReject={onReject ? () => onReject(order.id) : undefined}
            onDispatch={onDispatch ? () => onDispatch(order.id) : undefined}
            onFinish={onFinish ? () => onFinish(order.id) : undefined}
            onOpen={() => onOpen(order)}
          />
        ))}

        {orders.length === 0 && (
          <div className="text-gray-500 text-sm">Nenhum pedido</div>
        )}
      </div>
    </div>
  );
}
