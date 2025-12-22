"use client";

import React from "react";
import {
  Clock,
  Phone,
  FileText,
  Bike,
  ShoppingBag,
  Check,
  X,
  Truck,
  ClipboardCheck,
} from "lucide-react";

/* 🔒 Tipo padronizado com OrderBoard / OrderColumn */
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
  order: Order;
  selected?: boolean;

  loadingOrderId?: string | null;

  onToggle?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onDispatch?: () => void;
  onFinish?: () => void;
  onOpen?: () => void;
}

export default function OrderCard({
  order,
  selected = false,
  loadingOrderId = null,
  onToggle,
  onAccept,
  onReject,
  onDispatch,
  onFinish,
  onOpen,
}: Props) {
  const isLoading = loadingOrderId === order.id;

  return (
    <div
      className={`p-3 border rounded-lg transition-colors ${
        selected
          ? "bg-gray-100 border-gray-400"
          : "hover:bg-gray-50 border-gray-200"
      } ${isLoading ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
      onClick={() => onOpen?.()}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            disabled={isLoading}
            onChange={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="w-4 h-4"
          />

          <h3 className="font-semibold text-sm">
            #{order.id}
          </h3>
        </div>

        <span className="text-xs text-gray-500">
          {order.createdAt}
        </span>
      </div>

      {/* CLIENTE */}
      <p className="font-medium text-gray-800 truncate">
        {order.customer}
      </p>

      {/* ENDEREÇO */}
      {order.shortAddress && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
          <Bike size={12} />
          <span className="truncate">{order.shortAddress}</span>
        </div>
      )}

      {/* TELEFONE */}
      {order.phone && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
          <Phone size={12} />
          <span>{order.phone}</span>
        </div>
      )}

      {/* INFO */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center text-xs text-gray-700 gap-2">
          <ShoppingBag size={13} />
          <span>{order.items?.length ?? 0} itens</span>

          <FileText size={13} className="ml-2" />
          <span className="capitalize">{order.status}</span>
        </div>

        <span className="font-bold text-sm">
          R$ {order.total.toFixed(2).replace(".", ",")}
        </span>
      </div>

      {/* AÇÕES */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {onAccept && (
          <button
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            <Check size={12} /> Aceitar
          </button>
        )}

        {onDispatch && (
          <button
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onDispatch();
            }}
            className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            <Truck size={12} /> Despachar
          </button>
        )}

        {onFinish && (
          <button
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onFinish();
            }}
            className="flex items-center gap-1 text-xs bg-green-700 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            <ClipboardCheck size={12} /> Finalizar
          </button>
        )}

        {onReject && (
          <button
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
            className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded disabled:opacity-60"
          >
            <X size={12} /> Rejeitar
          </button>
        )}

        {/* MÉTODO DE PAGAMENTO */}
        {order.paymentMethod && (
          <div className="ml-auto text-xs text-gray-600 flex items-center gap-1">
            <Clock size={12} />
            {order.paymentMethod}
          </div>
        )}
      </div>
    </div>
  );
}
