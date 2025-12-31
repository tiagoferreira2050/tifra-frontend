"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  const total = items.reduce(
    (acc, item) => acc + item.price,
    0
  );

  if (!items || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Sua sacola está vazia 🛒
        </h2>
        <button
          onClick={() => router.back()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-32">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-purple-600 text-lg"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold">Sua sacola</h1>
      </div>

      {/* ITENS */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-start border-b pb-3"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Quantidade: {item.qty}
              </p>
            </div>

            <div className="font-semibold">
              R$ {item.price.toFixed(2).replace(".", ",")}
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mt-6 border-t pt-4 flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <button
          onClick={() => router.back()}
          className="w-full border border-green-600 text-green-600 py-3 rounded-lg"
        >
          Adicionar mais itens
        </button>

        <button
          onClick={() => {
            console.log("Ir para pagamento");
          }}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
