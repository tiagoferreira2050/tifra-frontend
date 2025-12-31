"use client";

import { useCart } from "@/contexts/CartContext";

export default function MiniCartBar() {
  const { items } = useCart();

  if (items.length === 0) return null;

  const total = items.reduce((acc, i) => acc + i.price, 0);

  return (
    <div className="
      fixed bottom-0 left-0 right-0 z-50
      bg-white border-t shadow-lg
      px-4 py-3
      flex justify-between items-center
    ">
      <div>
        <p className="text-sm font-medium">
          {items.length} item(ns) no carrinho
        </p>
        <p className="text-xs text-gray-500">
          Total: R$ {total.toFixed(2).replace(".", ",")}
        </p>
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Ver carrinho
      </button>
    </div>
  );
}
