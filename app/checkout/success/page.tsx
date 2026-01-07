"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const orderId = params.get("order");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`${API_URL}/api/public/order-success/${orderId}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [orderId, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando pedido…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erro ao carregar pedido
      </div>
    );
  }

  function openWhatsapp() {
    const message = `
🧾 *NOVO PEDIDO RECEBIDO*

👤 Cliente: ${data.customerName}
📦 Pedido: ${data.orderId}

${data.items
  .map((i: any) => `• ${i.qty}x ${i.name}`)
  .join("\n")}

${data.address ? `📍 Endereço: ${data.address}` : "🏪 Retirada no local"}

💰 Total: R$ ${data.total.toFixed(2)}
💳 Pagamento: ${data.paymentMethod}
    `;

    window.open(
      `https://wa.me/${data.storeWhatsapp}?text=${encodeURIComponent(message)}`,
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
        Seu pedido já chegou na loja.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={openWhatsapp}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          📲 Confirmar no WhatsApp da loja
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full border py-3 rounded-lg"
        >
          Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}
