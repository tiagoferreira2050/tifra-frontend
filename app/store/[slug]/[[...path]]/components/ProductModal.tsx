"use client";

interface ProductModalProps {
  product: any | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="relative">
          <img
            src={product.imageUrl || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-56 object-cover"
          />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm shadow"
          >
            ✕
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="p-4">
          <h2 className="text-lg font-bold">{product.name}</h2>

          {product.description && (
            <p className="text-sm text-gray-500 mt-1">
              {product.description}
            </p>
          )}

          <div className="mt-4 text-lg font-bold text-purple-600">
            R$ {Number(product.price).toFixed(2)}
          </div>

          {/* AQUI entram os COMPLEMENTOS depois */}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button className="w-full bg-purple-600 text-white rounded-xl py-3 font-semibold">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
