"use client";

import { useState } from "react";
import { useCart } from "../../../../../src/contexts/CartContext";
import CartModal from "./CartModal"; // ajuste o path se necessário

export default function MiniCartBar() {
  const { items, total } = useCart();
  const [open, setOpen] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <>
      {/* BARRA FIXA */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-40
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
          onClick={() => setOpen(true)}
        >
          Ver sacola
        </button>
      </div>

      {/* MODAL DA SACOLA */}
      <CartModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
