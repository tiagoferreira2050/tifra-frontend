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
  arrayMove,
} from "@dnd-kit/sortable";

import ProductItem from "./ProductItem";
import EditProductModal from "./EditProductModal";

import { useState } from "react";

export default function ProductList({
  categories,
  setCategories,
  selectedCategoryId,
  search,
  complements,
  onUpdateProduct,
}: any) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const selectedCategory = categories.find(
    (c: any) => c.id === selectedCategoryId
  );

  const products = selectedCategory?.products ?? [];

  const filtered = products.filter((p: any) =>
    (p.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  function updateProducts(newList: any[]) {
    setCategories((prev: any[]) =>
      prev.map((c: any) =>
        c.id === selectedCategoryId ? { ...c, products: newList } : c
      )
    );
  }

  function handleSaveEditedProduct(updated: any) {
    updateProducts(
      products.map((p: any) => (p.id === updated.id ? updated : p))
    );

    if (onUpdateProduct) onUpdateProduct(updated);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p: any) => p.id === active.id);
    const newIndex = products.findIndex((p: any) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(products, oldIndex, newIndex);
    updateProducts(reordered);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((p: any) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {filtered.map((prod: any) => (
              <ProductItem
                key={prod.id}
                id={prod.id}
                product={prod}
                complements={complements}
                
                onToggle={async () => {
                  const newActive = !prod.active;

                  updateProducts(
                    products.map((p: any) =>
                      p.id === prod.id ? { ...p, active: newActive } : p
                    )
                  );

                  await fetch(`/api/products/${prod.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ active: newActive }),
                  });
                }}

                onDelete={async () => {
                  updateProducts(products.filter((p: any) => p.id !== prod.id));

                  await fetch(`/api/products/${prod.id}`, {
                    method: "DELETE",
                  });
                }}

                onEdit={async (p: any) => {
                  try {
                    // 🔥 Buscar produto COMPLETO no servidor
                    const res = await fetch(`/api/products/${p.id}`, {
                      cache: "no-store",
                    });

                    const fullProduct = await res.json();

                    // 🔥 Garantir que os complementos venham no formato do modal
                    const normalized = Array.isArray(fullProduct.productComplements)
                      ? fullProduct.productComplements.map(
                          (pc: any, index: number) => ({
                            complementId: pc.groupId,
                            active: pc.active ?? true,
                            order: pc.order ?? index,
                          })
                        )
                      : [];

                    setEditingProduct({
                      ...fullProduct,
                      complements: normalized,
                    });

                    setEditOpen(true);
                  } catch (err) {
                    console.error("Erro ao carregar produto completo:", err);
                    alert("Erro ao carregar produto completo");
                  }
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-6">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      <EditProductModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        product={editingProduct}
        categories={categories}
        globalComplements={complements}
        onSave={handleSaveEditedProduct}
      />
    </>
  );
}
