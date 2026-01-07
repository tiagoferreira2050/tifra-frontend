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

export default function CheckoutSuccessPage() {
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

  /* ================= WHATSAPP ================= */
  function buildWhatsappMessage() {
    let message = `🧾 *NOVO PEDIDO RECEBIDO*\n\n`;
    message += `📌 Pedido: *${order.code}*\n`;
    message += `🏪 Loja: ${order.store.name}\n\n`;

    message += `👤 *Cliente*\n`;
    message += `${order.customer.name}\n`;
    message += `📞 ${order.customer.phone}\n\n`;

    message += `🚚 *Entrega*\n`;
    if (order.deliveryType === "delivery" && order.address) {
      message += `${order.address.street}, ${order.address.number}\n`;
      message += `${order.address.neighborhood}\n`;
      message += `${order.address.city} - ${order.address.state}\n\n`;
    } else if (order.deliveryType === "pickup") {
      message += `Retirada no local\n\n`;
    } else {
      message += `Consumir no local\n\n`;
    }

    message += `🛒 *Itens*\n`;
    order.items.forEach((item) => {
      message += `• ${item.quantity}x ${item.productName} - R$ ${item.unitPrice.toFixed(
        2
      )}\n`;
      if (item.observation) {
        message += `  Obs: ${item.observation}\n`;
      }
    });

    message += `\n💰 *Total:* R$ ${order.total.toFixed(2)}\n`;
    message += `💳 Pagamento: ${order.paymentMethod}\n\n`;
    message += `✅ Pedido enviado pelo cardápio online`;

    return encodeURIComponent(message);
  }

  function openWhatsapp() {
    const phone = order.store.phone.replace(/\D/g, "");
    const text = buildWhatsappMessage();
    window.open(
      `https://wa.me/55${phone}?text=${text}`,
      "_blank"
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* ÍCONE */}
      <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl mb-6">
        ✓
      </div>

      {/* TEXTO */}
      <h1 className="text-2xl font-bold mb-2">
        Pedido realizado com sucesso!
      </h1>

      <p className="text-gray-600 mb-4">
        Seu pedido foi enviado para a loja e já está em análise.
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Número do pedido:{" "}
        <span className="font-semibold">{order.code}</span>
      </p>

      {/* AÇÕES */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push("/")}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          Voltar ao cardápio
        </button>

        <button
          onClick={openWhatsapp}
          className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold"
        >
          📲 Confirmar pedido no WhatsApp
        </button>
      </div>
    </div>
  );
}
