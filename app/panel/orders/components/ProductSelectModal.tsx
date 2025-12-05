"use client";

import { X } from "lucide-react";

export default function ProductSelectModal({ open, onClose, product, onAdd }: any) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-lg shadow-lg p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          (Conteúdo da modal será colocado aqui depois)
        </p>

        <button
          onClick={() => {
            onAdd(product); 
            onClose();
          }}
          className="bg-green-600 text-white w-full py-2 rounded-md"
        >
          Adicionar mesmo sem personalização (temporário)
        </button>
      </div>
    </div>
  );
}
