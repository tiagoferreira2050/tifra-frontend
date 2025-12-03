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
  onClick?: () => void; // opcional (modal de compra depois)
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between gap-4 active:scale-[.98] transition hover:bg-gray-50"
    >
      {/* Área de texto */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Nome */}
        <span className="text-base font-semibold text-gray-900 truncate">
          {product.name}
        </span>

        {/* Descrição */}
        {product.description && (
          <span className="text-sm text-gray-500 line-clamp-2 mt-1">
            {product.description}
          </span>
        )}

        {/* Preço */}
        <span className="text-purple-600 font-bold text-sm mt-2">
          R$ {Number(product.price).toFixed(2)}
        </span>
      </div>

      {/* Imagem */}
      <div className="w-24 h-24 relative shrink-0 rounded-lg overflow-hidden bg-gray-200">
        <Image
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
    </button>
  );
}
