"use client";

import { useState } from "react";

/* =======================
   TIPOS
======================= */
type ComplementItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
};

type ComplementGroup = {
  id: string;
  title: string;
  min: number | null;
  max: number | null;
  items: ComplementItem[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  complementGroups: ComplementGroup[];
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/* =======================
   COMPONENT
======================= */
export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");

  if (!product) return null;

  /* =======================
     HELPERS
  ======================= */
  function toggleItem(group: ComplementGroup, itemId: string) {
    const current = selected[group.id] || [];

    if (current.includes(itemId)) {
      setSelected(prev => ({
        ...prev,
        [group.id]: current.filter(id => id !== itemId),
      }));
      return;
    }

    if (group.max && current.length >= group.max) return;

    setSelected(prev => ({
      ...prev,
      [group.id]: [...current, itemId],
    }));
  }

  function calculateTotal() {
    let total = product.price;

    product.complementGroups.forEach(group => {
      group.items.forEach(item => {
        if (selected[group.id]?.includes(item.id)) {
          total += item.price;
        }
      });
    });

    return (total * quantity).toFixed(2);
  }

  function isValid() {
    return product.complementGroups.every(group => {
      const count = selected[group.id]?.length || 0;
      if (group.min && count < group.min) return false;
      if (group.max && count > group.max) return false;
      return true;
    });
  }

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

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

        {/* BODY */}
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-lg font-bold">{product.name}</h2>

          {product.description && (
            <p className="text-sm text-gray-500 mt-1">
              {product.description}
            </p>
          )}

          <div className="mt-3 text-lg font-bold text-purple-600">
            R$ {Number(product.price).toFixed(2)}
          </div>

          {/* COMPLEMENTOS */}
          {product.complementGroups.map(group => {
            const selectedCount = selected[group.id]?.length || 0;

            return (
              <div key={group.id} className="mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{group.title}</h3>
                  {group.max && (
                    <span className="text-xs text-gray-500">
                      {selectedCount}/{group.max}
                    </span>
                  )}
                </div>

                {(group.min || group.max) && (
                  <p className="text-xs text-gray-500 mb-2">
                    {group.min
                      ? `Escolha no mínimo ${group.min}`
                      : `Escolha até ${group.max}`}
                  </p>
                )}

                <div className="space-y-2">
                  {group.items.map(item => {
                    const active =
                      selected[group.id]?.includes(item.id) || false;

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(group, item.id)}
                        className={`w-full flex justify-between items-center border rounded-lg px-3 py-2 text-sm ${
                          active
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200"
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="text-sm font-medium">
                          {item.price > 0
                            ? `+ R$ ${item.price.toFixed(2)}`
                            : "Grátis"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* OBSERVAÇÃO */}
          <div className="mt-6">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Ex: sem granola, bem caprichado..."
              className="w-full mt-2 border rounded-lg p-2 text-sm"
              rows={3}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t space-y-3">
          {/* QUANTIDADE */}
          <div className="flex justify-between items-center">
            <span className="font-medium">Quantidade</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full border"
              >
                +
              </button>
            </div>
          </div>

          {/* BOTÃO */}
          <button
            disabled={!isValid()}
            className={`w-full rounded-xl py-3 font-semibold text-white ${
              isValid()
                ? "bg-purple-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Adicionar • R$ {calculateTotal()}
          </button>
        </div>
      </div>
    </div>
  );
}
