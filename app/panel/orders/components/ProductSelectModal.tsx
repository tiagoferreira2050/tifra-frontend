"use client";

import { X, Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function ProductSelectModal({
  open,
  onClose,
  product,
  onAdd,
}: any) {
  if (!open || !product) return null;

  const [qty, setQty] = useState(1);

  const unitPrice = Number(product.price || 0);
  const subtotal = unitPrice * qty;

  function increase() {
    setQty((q: number) => q + 1);
  }

  function decrease() {
    setQty((q: number) => (q > 1 ? q - 1 : 1));
  }

  function handleAdd() {
    onAdd({
      id: product.id + "-" + Date.now(), // ID único local
      productId: product.id,
      name: product.name,
      unitPrice: unitPrice,
      quantity: qty,
      total: subtotal,
      complements: [], // 🔒 estrutura mantida
      categoryName: product.categoryName || null,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-lg shadow-lg p-6 overflow-y-auto">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ================= DESCRIÇÃO ================= */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4">
            {product.description}
          </p>
        )}

        {/* ================= PREÇO ================= */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-700">Preço unitário</span>
          <span className="font-semibold">
            R$ {unitPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* ================= QUANTIDADE ================= */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-700">Quantidade</span>

          <div className="flex items-center gap-3">
            <button
              onClick={decrease}
              className="p-1 border rounded"
            >
              <Minus size={16} />
            </button>

            <span className="font-semibold">{qty}</span>

            <button
              onClick={increase}
              className="p-1 border rounded"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* ================= SUBTOTAL ================= */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-700">Subtotal</span>
          <span className="font-bold text-lg">
            R$ {subtotal.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* ================= ACTION ================= */}
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 transition text-white w-full py-2 rounded-md font-semibold"
        >
          Adicionar ao pedido
        </button>
      </div>
    </div>
  );
}
