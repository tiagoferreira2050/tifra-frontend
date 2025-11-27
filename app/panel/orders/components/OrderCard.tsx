"use client";

import React from 'react';
import { Clock, Phone, FileText, Bike, ShoppingBag } from 'lucide-react';

/* 🔥 Tipo local — compatível com qualquer pedido do sistema */
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
  order: Order;
  onOpen: (order: Order) => void;
}

export default function OrderCard({ order, onOpen }: Props) {
  return (
    <div
      onClick={() => onOpen(order)}
      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">#{order.id}</h3>
        <span className="text-xs text-gray-500">{order.createdAt}</span>
      </div>

      <p className="font-medium text-gray-800">{order.customer}</p>

      {order.shortAddress && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
          <Bike size={12} />
          {order.shortAddress}
        </div>
      )}

      {order.phone && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
          <Phone size={12} />
          {order.phone}
        </div>
      )}

      <div className="flex justify-between mt-3">
        <div className="flex items-center text-xs text-gray-700 gap-1">
          <ShoppingBag size={13} />
          {order.items?.length ?? 0} itens
        </div>

        <span className="font-bold text-sm">
          R$ {order.total.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </div>
  );
}
