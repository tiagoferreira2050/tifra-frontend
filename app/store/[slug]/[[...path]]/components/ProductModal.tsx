"use client";

import { useState } from "react";
import TestModal from "./TestModal";

export default function ProductCard({ product }: { product: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => {
          console.log("🟢 CLICOU NO PRODUTO:", product);
          setOpen(true);
        }}
        className="cursor-pointer bg-white rounded-xl px-4 py-3 shadow"
      >
        <p className="font-semibold">{product.name}</p>
        <p className="text-sm text-gray-500">
          R$ {Number(product.price).toFixed(2)}
        </p>
      </div>

      {/* MODAL TESTE */}
      <TestModal
        open={open}
        product={product}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
