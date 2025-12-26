"use client";

import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    active?: boolean;
  };
  onClick?: () => void; // modal de compra (futuro)
}

export default function ProductCard({
  product,
  onClick,
}: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition hover:bg-gray-50 focus:outline-none"
    >
      {/* TEXTO */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* NOME */}
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {product.name}
        </h3>

        {/* DESCRIÇÃO */}
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        )}

        {/* PREÇO */}
        <div className="mt-3">
          <span className="text-purple-600 font-bold text-sm">
            R$ {Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>

      {/* IMAGEM */}
      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
          priority={false}
        />
      </div>
    </button>
  );
}
