"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

export default function ProductCard({ product }: { product: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => {
          console.log("🟢 CLIQUE NO PRODUTO:", product.id);
          setOpen(true);
        }}
        className="
          cursor-pointer
          bg-white
          rounded-xl
          px-4
          py-3
          flex
          justify-between
          items-center
          hover:bg-gray-50
        "
      >
        <div className="flex-1 pr-3">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm font-semibold">
            R$ {Number(product.price).toFixed(2)}
          </p>
        </div>
      </div>

      <ProductModal
        open={open}
        productId={product.id}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
