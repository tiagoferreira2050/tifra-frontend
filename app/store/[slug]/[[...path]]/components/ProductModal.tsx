"use client";

import { X } from "lucide-react";

export default function ProductModal({
  product,
  onClose,
}: {
  product: any;
  onClose: () => void;
}) {
  if (!product) return null;

  const groups = product.complementItems ?? [];

  console.log("🧪 PRODUCT NO MODAL:", product);
  console.log("🧪 COMPLEMENT ITEMS:", groups);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[80vh] rounded-lg shadow-lg p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {product.name}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* DEBUG */}
        <div className="mb-4 text-xs bg-gray-100 p-2 rounded">
          <strong>DEBUG:</strong> {groups.length} grupos encontrados
        </div>

        {/* SEM COMPLEMENTOS */}
        {groups.length === 0 && (
          <div className="text-center text-sm text-red-500">
            ⚠️ Nenhum complemento veio para este produto
          </div>
        )}

        {/* COMPLEMENTOS */}
        {groups.map((group: any) => (
          <div
            key={group.id}
            className="border rounded p-3 mb-4"
          >
            <div className="font-medium mb-2">
              {group.title}
            </div>

            {(group.options ?? []).length === 0 && (
              <p className="text-xs text-gray-400">
                Grupo sem opções
              </p>
            )}

            {group.options?.map((opt: any) => (
              <div
                key={opt.id}
                className="flex justify-between text-sm py-1"
              >
                <span>{opt.name}</span>
                <span className="text-gray-500">
                  R$ {Number(opt.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-4 bg-purple-600 text-white w-full py-2 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
