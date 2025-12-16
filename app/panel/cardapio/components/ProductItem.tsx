"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

export default function ProductItem({
  id,
  product,
  complements = [],
  onEdit,
  onDelete,
  onToggle,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function formatPrice(value: number | string | null | undefined) {
    if (value === null || value === undefined) return "0,00";
    const num = Number(value);
    return isNaN(num) ? "0,00" : num.toFixed(2).replace(".", ",");
  }

  // ✅ CORREÇÃO CRÍTICA PARA BUILD
  const hasDiscount =
    product &&
    product.discount &&
    typeof product.discount.price === "number";

  // =====================================================
  // COMPLEMENTOS
  // =====================================================
  const complementTitles =
    Array.isArray(product?.complements) && product.complements.length > 0
      ? product.complements
          .map((pc: any) => {
            const groupId =
              pc.complementId || pc.groupId || pc.id || null;

            if (!groupId) return null;

            const group = complements.find((c: any) => c.id === groupId);
            return group ? group.title || group.name : null;
          })
          .filter(Boolean)
          .join(", ")
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-3 flex items-center justify-between bg-white hover:bg-gray-50 shadow-sm transition"
    >
      {/* DRAG */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex items-center gap-4 flex-1">
        {/* TOGGLE */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={!!product?.active}
            onChange={onToggle}
          />
          <div
            className={`w-10 h-5 rounded-full p-1 flex items-center transition ${
              product?.active ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                product?.active ? "translate-x-5" : ""
              }`}
            />
          </div>
        </label>

        {/* IMAGE */}
        <img
          src={product?.imageUrl || "/placeholder-100.png"}
          onError={(e) => (e.currentTarget.src = "/placeholder-100.png")}
          className="w-16 h-16 rounded-md object-cover shadow-sm"
          alt={product?.name || "Produto"}
        />

        {/* INFO */}
        <div className="flex flex-col w-full">
          <p className="font-medium leading-tight">{product?.name}</p>

          {hasDiscount ? (
            <div className="text-sm leading-tight mt-1">
              <span className="text-red-600 font-semibold">
                R$ {formatPrice(product.discount.price)}
              </span>
              <span className="text-gray-500 line-through ml-2">
                R$ {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-700 font-semibold mt-1">
              R$ {formatPrice(product?.price)}
            </p>
          )}

          {complementTitles && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              Complementos: {complementTitles}
            </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 text-gray-600">
        <button
          onClick={() => onEdit(product)}
          className="p-2 hover:text-blue-600 transition"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 hover:text-red-600 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
