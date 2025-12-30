"use client";

import { X } from "lucide-react";

export default function ComplementTestModal({
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

  console.log("🧪 PRODUTO NO MODAL:", product);
  console.log("🧪 COMPLEMENTOS NO MODAL:", groups);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[600px]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Complementos do produto
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* DEBUG */}
        <div className="text-xs bg-gray-100 p-2 rounded mb-4">
          Grupos encontrados: {groups.length}
        </div>

        {/* SEM COMPLEMENTOS */}
        {groups.length === 0 && (
          <div className="text-center text-red-500 text-sm">
            ❌ Este produto NÃO possui complementos no cardápio público
          </div>
        )}

        {/* LISTAGEM SIMPLES (IGUAL GESTOR) */}
        {groups.map((group: any) => (
          <div key={group.id} className="border rounded p-3 mb-3">
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

        <button
          onClick={onClose}
          className="mt-4 w-full bg-purple-600 text-white py-2 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
