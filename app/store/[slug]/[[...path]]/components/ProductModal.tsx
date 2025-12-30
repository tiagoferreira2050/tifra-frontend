"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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
  complementGroups?: ComplementGroup[];
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/* =======================
   COMPONENT
======================= */
export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");

  /* =======================
     LOAD PRODUTO COMPLETO
  ======================= */
  useEffect(() => {
    if (!product?.id) return;

    async function loadProduct() {
      try {
        const data = await apiFetch(`/store/product/${product.id}`);
        setFullProduct(data);
      } catch (err) {
        console.error("Erro ao carregar produto completo", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [product?.id]);

  if (!product) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl px-6 py-4 shadow">
          Carregando opções...
        </div>
      </div>
    );
  }

  const productData = fullProduct || product;

  const complementGroups: ComplementGroup[] =
    productData.complementGroups || [];

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
    let total = productData.price;

    complementGroups.forEach(group => {
      group.items.forEach(item => {
        if (selected[group.id]?.includes(item.id)) {
          total += item.price;
        }
      });
    });

    return (total * quantity).toFixed(2);
  }

  function isValid() {
    return complementGroups.every(group => {
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
      <div
        className="
          bg-white
          w-full
          sm:max-w-lg
          rounded-t-2xl
          sm:rounded-2xl
          overflow-hidden
          max-h-[90vh]
          flex
          flex-col
          border
          border-gray-200
          shadow-xl
        "
      >
        {/* HEADER */}
        <div className="relative">
          <img
            src={productData.imageUrl || "/placeholder.jpg"}
            alt={productData.name}
            className="w-full h-64 object-cover"
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
          <h2 className="text-xl font-semibold text-gray-900">
            {productData.name}
          </h2>

          {productData.description && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {productData.description}
            </p>
          )}

          <div className="mt-4 text-base font-semibold text-gray-800">
            R$ {Number(productData.price).toFixed(2)}
          </div>

          {/* COMPLEMENTOS */}
          {complementGroups.map(group => {
            const selectedCount = selected[group.id]?.length || 0;

            return (
              <div key={group.id} className="mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">
                    {group.title}
                  </h3>

                  {group.max && (
                    <span className="text-xs text-gray-500">
                      {selectedCount}/{group.max}
                    </span>
                  )}
                </div>

                {(group.min || group.max) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {group.min
                      ? `Escolha no mínimo ${group.min}`
                      : `Escolha até ${group.max}`}
                  </p>
                )}

                {group.min && selectedCount < group.min && (
                  <p className="text-xs text-red-500 mt-1">
                    Escolha pelo menos {group.min}
                  </p>
                )}

                <div className="mt-3 space-y-2">
                  {group.items.map(item => {
                    const active =
                      selected[group.id]?.includes(item.id) || false;

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(group, item.id)}
                        className={`
                          w-full
                          flex
                          justify-between
                          items-center
                          border
                          rounded-lg
                          px-3
                          py-2
                          text-sm
                          transition
                          ${
                            active
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }
                        `}
                      >
                        <span>{item.name}</span>
                        <span className="font-medium text-sm">
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
            <label className="text-sm font-medium">
              Observações
            </label>

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

          <button
            disabled={!isValid()}
            className={`w-full rounded-xl py-3 font-semibold text-white ${
              isValid()
                ? "bg-purple-600 hover:bg-purple-700"
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
