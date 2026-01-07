"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessClient() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order");

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
        <span className="font-semibold break-all">
          {orderId}
        </span>
      </p>

      <button
        onClick={handleBackToStore}
        className="w-full max-w-xs bg-green-600 text-white py-3 rounded-lg font-semibold"
      >
        Voltar ao cardápio
      </button>
    </div>
  );
}
