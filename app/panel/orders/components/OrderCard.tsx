'use client';

import React from 'react';
import { Order } from '../services/orderService';
import { Clock, Phone, FileText, Bike, ShoppingBag } from 'lucide-react';

interface Props {
  order: Order;
  selected: boolean;
  onToggle: () => void;

  onAccept?: () => void;
  onReject?: () => void;
  onDispatch?: () => void;
  onFinish?: () => void;

  onOpen: () => void;
}

export default function OrderCard({
  order,
  selected,
  onToggle,
  onAccept,
  onReject,
  onDispatch,
  onFinish,
  onOpen,
}: Props) {
  
  const isPickup = order.deliveryType === 'retirada';

  function openWhats() {
    if (!order.phone) return;
    const clean = order.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${clean}`, '_blank');
  }

  /* --- FORMATA NOME (Primeiro + Sobrenome) --- */
  function formatName(full: string) {
    if (!full) return "Cliente";

    const parts = full.trim().split(" ");

    if (parts.length === 1) return parts[0];

    return `${parts[0]} ${parts[1]}`;
  }

  const formattedName = formatName(order.customerName ?? order.customer);

  return (
    <div className="border-2 border-red-300 rounded-xl bg-white shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition">

      {/* HEADER DA LOJA */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src={order.origin === 'tifra' ? '/tifra-logo.png' : '/ifood.png'}
            className="w-5 h-5"
          />

          <span className="font-semibold">{order.storeName ?? 'Açaí Brasil'}</span>
        </div>

        <button
          className="text-gray-500 hover:text-gray-800"
          onClick={() => alert('Menu: Mudar status / Cancelar (em breve)')}
        >
          ⋮
        </button>

        <input type="checkbox" checked={selected} onChange={onToggle} />
      </div>

      {/* TEMPO + AÇÕES */}
      <div className="flex justify-between">
        <div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock size={14} />
            {order.timeAgo ?? 'Há 15min'}
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          {isPickup ? <ShoppingBag size={20} /> : <Bike size={20} />}

          <Phone
            size={20}
            onClick={openWhats}
            className="cursor-pointer hover:text-green-600"
          />

          <FileText
            size={20}
            onClick={onOpen}
            className="cursor-pointer hover:text-purple-600"
          />
        </div>
      </div>

      {/* --- CLIENTE + CÓDIGO (ÚNICO LOCAL DO CÓDIGO) --- */}
      <div className="font-semibold text-base text-gray-900">
        {formattedName} — {order.code ?? order.id}
      </div>

      {/* Endereço */}
      <div className="text-xs text-gray-600">{order.shortAddress}</div>

      {/* Pagamento */}
      <div className="text-xs font-semibold">{paymentBrief(order)}</div>

      {/* Valor */}
      <div className="text-xl font-bold text-green-700">
        R$ {order.total.toFixed(2)}
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-3">

        {onReject && (
          <button
            onClick={onReject}
            className="bg-red-600 text-white px-4 py-1 rounded-md"
          >
            Recusar
          </button>
        )}

        {onAccept && (
          <button
            onClick={onAccept}
            className="bg-green-600 text-white px-4 py-1 rounded-md"
          >
            Aceitar
          </button>
        )}

        {onDispatch && !onFinish && (
          <button
            onClick={onDispatch}
            className="bg-blue-600 text-white px-4 py-1 rounded-md"
          >
            Despachar
          </button>
        )}

        {onFinish && (
          <button
            onClick={onFinish}
            className="bg-purple-600 text-white px-4 py-1 rounded-md"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------ Pagamento resumido ------------ */
function paymentBrief(order: Order) {
  if (!order.paymentMethod) return '-';

  const pm = order.paymentMethod.toLowerCase();

  if (pm.includes('dinheiro')) {
    return order.changeFor
      ? `Dinheiro (troco R$ ${order.changeFor})`
      : 'Dinheiro';
  }

  if (pm.includes('cart')) return 'Cartão';

  return order.paymentMethod;
}
