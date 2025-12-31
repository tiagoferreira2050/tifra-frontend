"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../contexts/CartContext";

export default function MiniCartBar() {
  const router = useRouter();
  const { items, total } = useCart();

  if (!items || items.length === 0) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t shadow-lg
        px-4 py-3
        flex justify-between items-center
      "
    >
      {/* INFO */}
      <div>
        <p className="text-sm font-medium">
          {items.length} item(ns) no carrinho
        </p>
        <p className="text-xs text-gray-500">
          Total: R$ {total.toFixed(2).replace(".", ",")}
        </p>
      </div>

      {/* AÇÃO */}
      <button
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        onClick={() => {
          router.push("checkout");
        }}
      >
        Ver carrinho
      </button>
    </div>
  );
}
