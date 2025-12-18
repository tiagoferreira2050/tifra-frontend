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
} from "@dnd-kit/sortable";

import ProductItem from "./ProductItem";

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
  // TOGGLE ATIVO (UI otimista)
  // =====================================================
  function handleToggleProduct(productId: string) {
    setCategories((prev: any[]) =>
      prev.map((cat: any) =>
        cat.id !== selectedCategoryId
          ? cat
          : {
              ...cat,
              products: Array.isArray(cat.products)
                ? cat.products.map((p: any) =>
                    p.id === productId
                      ? { ...p, active: !p.active }
                      : p
                  )
                : [],
            }
      )
    );
  }

  // =====================================================
  // DELETE (UI otimista)
  // =====================================================
 async function handleDeleteProduct(productId: string) {
  if (!confirm("Excluir este produto?")) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/products`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: productId }),
      }
    );

    if (!res.ok) {
      throw new Error("Erro ao excluir produto");
    }

    // UI otimista
    setCategories((prev: any[]) =>
      prev.map((cat) =>
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
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    alert("Erro ao excluir produto");
  }
}


  // =====================================================
  // UI — SEM CATEGORIA
  // =====================================================
  if (!selectedCategory) {
    return (
      <div className="text-gray-500 text-sm">
        Selecione uma categoria
      </div>
    );
  }

  // =====================================================
  // UI — CATEGORIA VAZIA
  // =====================================================
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

  // =====================================================
  // UI — LISTA DE PRODUTOS
  // =====================================================
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
                onDelete={(id: string) =>
                  handleDeleteProduct(id)
                }
                onToggle={(id: string) =>
                  handleToggleProduct(id)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
