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
  Lock,
} from "lucide-react";

/* 🔒 Tipo padronizado */
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
  cancelReason?: string;
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
  const isCanceled = order.status === "canceled";

  return (
    <div
      className={`p-3 border rounded-lg transition-colors
        ${
          isCanceled
            ? "bg-red-50 border-red-500 opacity-80"
            : selected
            ? "bg-gray-100 border-gray-400"
            : "bg-white hover:bg-gray-50 border-gray-200"
        }
        ${isLoading ? "opacity-60 pointer-events-none" : "cursor-pointer"}
      `}
      onClick={() => onOpen?.()}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {!isCanceled && (
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
          )}

          <h3 className="font-semibold text-sm">
            #{order.id}
          </h3>

          {isCanceled && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <Lock size={12} />
              CANCELADO
            </span>
          )}
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

      {/* MOTIVO DO CANCELAMENTO */}
      {isCanceled && order.cancelReason && (
        <span className="mt-2 inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
          {order.cancelReason}
        </span>
      )}

      {/* INFO */}
      <div className="flex justify-between items-center mt-3">
  <div className="flex items-center text-xs text-gray-700 gap-2">
    <ShoppingBag size={13} />
    <span>{order.items?.length ?? 0} itens</span>

    <FileText size={13} className="ml-2" />

    {order.status === "canceled" ? (
      <span className="font-bold text-red-600">
        CANCELADO
      </span>
    ) : (
      <span className="capitalize text-gray-600">
        {order.status}
      </span>
    )}
  </div>

  <span className="font-bold text-sm">
    R$ {order.total.toFixed(2).replace(".", ",")}
  </span>
</div>


      {/* AÇÕES (SÓ SE NÃO FOR CANCELADO) */}
      {!isCanceled && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {onAccept && (
            <button
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded"
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
              className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded"
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
              className="flex items-center gap-1 text-xs bg-green-700 text-white px-2 py-1 rounded"
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
              className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
            >
              <X size={12} /> Rejeitar
            </button>
          )}

          {order.paymentMethod && (
            <div className="ml-auto text-xs text-gray-600 flex items-center gap-1">
              <Clock size={12} />
              {order.paymentMethod}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
