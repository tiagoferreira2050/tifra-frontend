"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  observation?: string;
};

type OrderData = {
  id: string;
  code: string;
  store: {
    name: string;
    phone: string;
  };
  customer: {
    name: string;
    phone: string;
  };
  deliveryType: "delivery" | "pickup" | "local";
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: OrderItem[];
  total: number;
  paymentMethod: string;
};

export default function CheckoutSuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Pedido não encontrado");

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("[SUCCESS PAGE]", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Pedido não encontrado
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando pedido…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erro ao carregar pedido
      </div>
    );
  }

  function openWhatsapp() {
    const phone = order.store.phone.replace(/\D/g, "");
    let message = `🧾 *NOVO PEDIDO*\n\n`;
    message += `Pedido: *${order.code}*\n\n`;
    message += `👤 ${order.customer.name}\n`;
    message += `📞 ${order.customer.phone}\n\n`;

    if (order.deliveryType === "delivery" && order.address) {
      message += `📍 ${order.address.street}, ${order.address.number}\n`;
      message += `${order.address.neighborhood}\n`;
      message += `${order.address.city} - ${order.address.state}\n\n`;
    }

    message += `🛒 *Itens*\n`;
    order.items.forEach((i) => {
      message += `• ${i.quantity}x ${i.productName}\n`;
    });

    message += `\n💰 Total: R$ ${order.total.toFixed(2)}`;

    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl mb-6">
        ✓
      </div>

      <h1 className="text-2xl font-bold mb-2">
        Pedido realizado com sucesso!
      </h1>

      <p className="text-gray-600 mb-6">
        Pedido #{order.code} enviado para a loja
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          Voltar ao cardápio
        </button>

        <button
          onClick={openWhatsapp}
          className="border border-green-600 text-green-600 py-3 rounded-lg font-semibold"
        >
          📲 Confirmar no WhatsApp
        </button>
      </div>
    </div>
  );
}
