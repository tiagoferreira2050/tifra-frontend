"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../../../../src/contexts/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, updateQty, removeItem } = useCart();

  if (!items || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Sua sacola está vazia 🛒
        </h2>

        <button
          onClick={() => router.back()}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 pb-28">
      <h1 className="text-2xl font-semibold mb-6">
        Sua sacola
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border rounded-lg p-4"
          >
            <div>
              <p className="font-medium">{item.name}</p>

              <p className="text-sm text-gray-500">
                R$ {item.unitPrice.toFixed(2).replace(".", ",")}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  className="border rounded px-2"
                  onClick={() =>
                    updateQty(
                      item.id,
                      Math.max(1, item.qty - 1)
                    )
                  }
                >
                  −
                </button>

                <span>{item.qty}</span>

                <button
                  className="border rounded px-2"
                  onClick={() =>
                    updateQty(item.id, item.qty + 1)
                  }
                >
                  +
                </button>

                <button
                  className="text-red-500 text-sm ml-3"
                  onClick={() => removeItem(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>

            <div className="font-semibold">
              R${" "}
              {(item.unitPrice * item.qty)
                .toFixed(2)
                .replace(".", ",")}
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="border-t mt-6 pt-4 flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>

      {/* CTA */}
      <button
        className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl"
        onClick={() => {
          console.log("Ir para pagamento");
        }}
      >
        Continuar para pagamento
      </button>
    </div>
  );
}
