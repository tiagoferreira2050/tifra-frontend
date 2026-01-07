"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutSuccessClient() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order");

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Pedido não encontrado
      </div>
    );
  }

  function openWhatsapp() {
    // ⚠️ aqui você pode usar o telefone fixo da loja
    // ou depois puxar isso de settings públicos
    const phone = "5533999999999";

    const message = `
🧾 *PEDIDO REALIZADO COM SUCESSO*

📦 Número do pedido:
${orderId}

✅ O pedido já chegou para a loja.
Em breve ele será confirmado.

Obrigado! 🙌
    `;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
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

      <p className="text-gray-600 mb-4">
        Seu pedido foi enviado para a loja.
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Número do pedido:
        <br />
        <span className="font-semibold break-all">
          {orderId}
        </span>
      </p>

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
          📲 Confirmar no WhatsApp
        </button>
      </div>
    </div>
  );
}
