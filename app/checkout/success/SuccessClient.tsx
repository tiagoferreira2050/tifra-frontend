"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessClient() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Pedido não encontrado
      </div>
    );
  }

  function handleBackToStore() {
    router.push("/");
  }

  async function handleWhatsapp() {
    if (!API_URL) {
      alert("API não configurada");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/public/orders/${orderId}/whatsapp`
      );

      if (!res.ok) {
        throw new Error("Erro ao gerar WhatsApp");
      }

      const data = await res.json();

      if (!data?.whatsapp || !data?.messageEncoded) {
        alert("WhatsApp não configurado para esta loja");
        return;
      }

      const whatsappUrl = `https://wa.me/${data.whatsapp}?text=${data.messageEncoded}`;

      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Erro ao abrir WhatsApp");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* ÍCONE */}
      <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl mb-6">
        ✓
      </div>

      <h1 className="text-2xl font-bold mb-2">
        Pedido realizado com sucesso!
      </h1>

      <p className="text-gray-600 mb-4">
        Seu pedido foi enviado para a loja e já está em análise.
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Número do pedido:
        <br />
        <span className="font-semibold break-all">{orderId}</span>
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* 🔥 WHATSAPP */}
        <button
          onClick={handleWhatsapp}
          className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold"
        >
          Confirmar pedido no WhatsApp
        </button>

        {/* VOLTAR */}
        <button
          onClick={handleBackToStore}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}
