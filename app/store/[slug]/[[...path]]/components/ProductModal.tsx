"use client";

import { X } from "lucide-react";

export default function ProductModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: any;
  onClose: () => void;
}) {
  if (!open || !product) return null;

  const groups = product.complementItems ?? [];

  console.log("🧪 PRODUTO RECEBIDO NO MODAL:", product);
  console.log("🧪 COMPLEMENTOS:", groups);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[620px] max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-lg">
            {product.name}
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* DEBUG */}
        <div className="mb-4 text-xs bg-gray-100 p-2 rounded">
          Complementos encontrados: {groups.length}
        </div>

        {/* SEM COMPLEMENTOS */}
        {groups.length === 0 && (
          <div className="text-center text-red-500 text-sm">
            ❌ Nenhum complemento chegou nesse produto
          </div>
        )}

        {/* COMPLEMENTOS (IGUAL GESTOR) */}
        {groups.map((group: any) => (
          <div key={group.id} className="border rounded p-3 mb-4">
            <p className="font-medium mb-2">
              {group.title}
            </p>

            {(group.options ?? []).map((opt: any) => (
              <div
                key={opt.id}
                className="flex justify-between text-sm py-1"
              >
                <span>{opt.name}</span>
                <span className="text-gray-500">
                  R$ {Number(opt.price).toFixed(2).replace(".", ",")}
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
