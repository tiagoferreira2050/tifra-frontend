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
  categories,
  setCategories,
  selectedCategoryId,
  search = "",
  complements = [],
  onUpdateProduct,
  onCreateProduct, // ✅ abre modal
}: any) {
  const sensors = useSensors(useSensor(PointerSensor));

  const selectedCategory = categories.find(
    (c: any) => c.id === selectedCategoryId
  );

  // 🔒 BLINDAGEM TOTAL: só produtos válidos
  const products = Array.isArray(selectedCategory?.products)
    ? selectedCategory.products.filter(
        (p: any) => p && p.id && p.name
      )
    : [];

  function handleToggleProduct(productId: string) {
    setCategories((prev: any[]) =>
      prev.map((cat) =>
        cat.id !== selectedCategoryId
          ? cat
          : {
              ...cat,
              products: cat.products.map((p: any) =>
                p.id === productId
                  ? { ...p, active: !p.active }
                  : p
              ),
            }
      )
    );
  }

  function handleDeleteProduct(productId: string) {
    if (!confirm("Excluir este produto?")) return;

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
  }

  // ❗ Nenhuma categoria selecionada
  if (!selectedCategory) {
    return (
      <div className="text-gray-500 text-sm">
        Selecione uma categoria
      </div>
    );
  }

  // ✅ Categoria existe, mas NÃO tem produto
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

  // ✅ Categoria COM produtos (botão fixo)
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
                onEdit={() => onUpdateProduct(product)}
                onDelete={() => handleDeleteProduct(product.id)}
                onToggle={() => handleToggleProduct(product.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
