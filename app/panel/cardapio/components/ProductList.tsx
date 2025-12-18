"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove, // ✅ SOMENTE ISSO FOI ADICIONADO
} from "@dnd-kit/sortable";

import ProductItem from "./ProductItem";
import { apiFetch } from "@/lib/api";

export default function ProductList({
  categories = [],
  setCategories,
  selectedCategoryId,
  search = "",
  complements = [],
  onUpdateProduct,
  onCreateProduct,
}: any) {
  const sensors = useSensors(useSensor(PointerSensor));

  // =====================================================
  // CATEGORIA SELECIONADA (BLINDADA)
  // =====================================================
  const selectedCategory = Array.isArray(categories)
    ? categories.find((c: any) => c.id === selectedCategoryId)
    : null;

  // =====================================================
  // PRODUTOS VÁLIDOS
  // =====================================================
  const products = Array.isArray(selectedCategory?.products)
    ? selectedCategory.products.filter(
        (p: any) => p && p.id && p.name
      )
    : [];

  // =====================================================
  // TOGGLE ATIVO (NÃO MEXIDO)
  // =====================================================
  async function handleToggleProduct(productId: string) {
    const current = products.find((p: any) => p.id === productId);
    if (!current) return;

    const newActive = !current.active;

    setCategories((prev: any[]) =>
      prev.map((cat: any) =>
        cat.id !== selectedCategoryId
          ? cat
          : {
              ...cat,
              products: cat.products.map((p: any) =>
                p.id === productId ? { ...p, active: newActive } : p
              ),
            }
      )
    );

    try {
      await apiFetch(`/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ active: newActive }),
      });
    } catch {
      alert("Erro ao atualizar status do produto");
    }
  }

  // =====================================================
  // DELETE PRODUTO (NÃO MEXIDO)
  // =====================================================
  async function handleDeleteProduct(productId: string) {
    if (!confirm("Excluir este produto?")) return;

    try {
      await apiFetch("/products", {
        method: "DELETE",
        body: { id: productId },
      });

      setCategories((prev: any[]) =>
        prev.map((cat: any) =>
          cat.id !== selectedCategoryId
            ? cat
            : {
                ...cat,
                products: cat.products.filter(
                  (p: any) => p.id !== productId
                ),
              }
        )
      );
    } catch {
      alert("Erro ao excluir produto");
    }
  }

  // =====================================================
  // REORDENAR PRODUTOS (NOVO – ISOLADO)
  // =====================================================
  async function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let newOrder: any[] = [];

    setCategories((prev: any[]) =>
      prev.map((cat: any) => {
        if (cat.id !== selectedCategoryId) return cat;

        const oldIndex = cat.products.findIndex(
          (p: any) => p.id === active.id
        );
        const newIndex = cat.products.findIndex(
          (p: any) => p.id === over.id
        );

        if (oldIndex === -1 || newIndex === -1) return cat;

        const reordered = arrayMove(
          cat.products,
          oldIndex,
          newIndex
        );

        newOrder = reordered;

        return {
          ...cat,
          products: reordered,
        };
      })
    );

    if (!newOrder.length) return;

    try {
      await apiFetch("/products/reorder", {
        method: "POST",
        body: {
          productIds: newOrder.map((p: any) => p.id),
        },
      });
    } catch {
      alert("Erro ao salvar ordem dos produtos");
    }
  }

  // =====================================================
  // UI
  // =====================================================
  if (!selectedCategory) {
    return (
      <div className="text-gray-500 text-sm">
        Selecione uma categoria
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={onCreateProduct}
          className="self-start bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          + Criar produto
        </button>
        <div className="text-gray-400 text-sm">
          Nenhum produto nesta categoria
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onCreateProduct}
        className="self-start bg-red-600 text-white px-4 py-2 rounded-md text-sm"
      >
        + Criar produto
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd} // ✅ ÚNICA LIGAÇÃO NOVA
      >
        <SortableContext
          items={products.map((p: any) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {products.map((product: any) => (
              <ProductItem
                key={product.id}
                id={product.id}
                product={product}
                complements={complements}
                onEdit={(p: any) => onUpdateProduct(p)}
                onDelete={handleDeleteProduct}
                onToggle={handleToggleProduct}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
