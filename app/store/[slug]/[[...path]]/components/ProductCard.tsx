"use client";

import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <button
      type="button"
      className="w-full bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-4 flex gap-4 text-left active:scale-[0.98]"
    >
      {/* TEXTO */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-3 text-purple-600 font-bold">
          R$ {Number(product.price).toFixed(2)}
        </div>
      </div>

      {/* IMAGEM */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        <Image
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
    </button>
  );
}
