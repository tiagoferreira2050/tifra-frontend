"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

export default function ProductCard({ product }: { product: any }) {
  const [open, setOpen] = useState(false);

  function closeModal() {
    setOpen(false);
  }

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => {
          console.log("🟢 CLICOU NO PRODUTO:", product.id);
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
          transition
        "
      >
        <div className="pr-3 flex-1">
          <h3 className="text-base font-medium text-gray-900">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}

          <p className="mt-2 text-sm font-semibold text-gray-800">
            R$ {Number(product.price).toFixed(2)}
          </p>
        </div>

        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
      </div>

      {/* MODAL */}
      <ProductModal
        open={open}
        productId={product.id}
        onClose={closeModal}
      />
    </>
  );
}
