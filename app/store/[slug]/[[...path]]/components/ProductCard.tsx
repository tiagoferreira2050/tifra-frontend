"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

export default function ProductCard({ product }: { product: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer border rounded-xl p-3 flex justify-between items-center"
      >
        <div>
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-500">
            R$ {Number(product.price).toFixed(2)}
          </p>
        </div>

        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
      </div>

      {/* MODAL */}
      {open && (
        <ProductModal
          product={product}   // 🔥 ISSO É O MAIS IMPORTANTE
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
