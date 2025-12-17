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

  // =====================================================
  // HELPERS
  // =====================================================
  function formatPrice(value: number | string | null | undefined) {
    const num = Number(value);
    return isNaN(num) ? "0,00" : num.toFixed(2).replace(".", ",");
  }

  // =====================================================
  // IMAGEM (BLINDADA)
  // =====================================================
  const imageSrc =
    typeof product?.imageUrl === "string" && product.imageUrl.startsWith("http")
      ? product.imageUrl
      : "/placeholder-100.png";

  // =====================================================
  // DESCONTO (SE EXISTIR)
  // =====================================================
  const discountPrice =
    typeof product?.discount?.price === "number"
      ? product.discount.price
      : null;

  const hasDiscount = discountPrice !== null;

  // =====================================================
  // COMPLEMENTOS (PADRÃO COMPLEMENTS)
  // =====================================================
  const productComplementIds: string[] = Array.isArray(
    product?.productComplements
  )
    ? product.productComplements.map((pc: any) => pc.groupId)
    : Array.isArray(product?.complements)
    ? product.complements.map(
        (pc: any) => pc.groupId || pc.complementId
      )
    : [];

  const complementTitles =
    productComplementIds.length > 0
      ? productComplementIds
          .map((groupId) => {
            const group = complements.find(
              (c: any) => c.id === groupId
            );
            return group?.title || group?.name || null;
          })
          .filter(Boolean)
          .join(", ")
      : null;

  // =====================================================
  // UI
  // =====================================================
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
        className="cursor-grab p-2 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>

      {/* CONTEÚDO */}
      <div className="flex items-center gap-4 flex-1">
        {/* TOGGLE ATIVO */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={!!product?.active}
            onChange={() => onToggle?.(product.id)}
          />
          <div
            className={`w-10 h-5 rounded-full p-1 flex items-center transition-all ${
              product?.active ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition-all ${
                product?.active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>

        {/* IMAGEM */}
        <img
          src={imageSrc}
          onError={(e) =>
            (e.currentTarget.src = "/placeholder-100.png")
          }
          className="w-16 h-16 rounded-md object-cover shadow-sm"
          alt={product?.name || "Produto"}
        />

        {/* INFO */}
        <div className="flex flex-col w-full">
          <p className="font-medium leading-tight">
            {product?.name || "Produto sem nome"}
          </p>

          {hasDiscount ? (
            <div className="text-sm leading-tight mt-1">
              <span className="text-red-600 font-semibold">
                R$ {formatPrice(discountPrice)}
              </span>
              <span className="text-gray-500 line-through ml-2">
                R$ {formatPrice(product?.price)}
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

      {/* AÇÕES */}
      <div className="flex items-center gap-3 text-gray-600">
        <button
          onClick={() => onEdit?.(product)}
          className="p-2 hover:text-blue-600 transition"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => onDelete?.(product.id)}
          className="p-2 hover:text-red-600 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
