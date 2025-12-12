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

  // =====================================================
  // STATE
  // =====================================================
  const [editingProduct, setEditingProduct] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  // Categoria selecionada
  const selectedCategory = categories.find(
    (c: any) => c.id === selectedCategoryId
  );

  // Lista de produtos
  const products = selectedCategory?.products ?? [];

  // Filtro por nome
  const filtered = products.filter((p: any) =>
    (p.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  // =====================================================
  // ATUALIZA LISTA LOCAL DE PRODUTOS
  // =====================================================
  function updateProducts(newList: any[]) {
    setCategories((prev: any[]) =>
      prev.map((c: any) =>
        c.id === selectedCategoryId ? { ...c, products: newList } : c
      )
    );
  }

  // =====================================================
  // SALVAR EDIÇÃO DO PRODUTO
  // =====================================================
  function handleSaveEditedProduct(updated: any) {
    updateProducts(
      products.map((p: any) => (p.id === updated.id ? updated : p))
    );

    if (onUpdateProduct) onUpdateProduct(updated);
  }

  // =====================================================
  // DRAG & DROP CONFIG
  // =====================================================
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

  // Atualiza localmente
  const reordered = arrayMove(products, oldIndex, newIndex);
  updateProducts(reordered);

  // 🔥 Salvar no servidor
  fetch("/api/products/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productIds: reordered.map((p: any) => p.id),
    }),
  });
}


  // =====================================================
  // RENDER
  // =====================================================
  return (
    <>
      <div className="flex flex-col gap-4">
        
        {/* ===================== DRAG ZONE ===================== */}
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

                // ===================== TOGGLE ACTIVE =====================
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

                // ===================== DELETE =====================
                onDelete={async () => {
                  try {
                    const res = await fetch(`/api/products/${prod.id}`, {
                      method: "DELETE",
                    });

                    if (!res.ok) {
                      alert("Erro ao excluir produto.");
                      return;
                    }

                    // Só remove local após confirmação do backend
                    updateProducts(
                      products.filter((p: any) => p.id !== prod.id)
                    );

                  } catch (err) {
                    console.error("Erro ao excluir:", err);
                    alert("Falha ao excluir produto.");
                  }
                }}

                // ===================== EDIT =====================
                onEdit={async (p: any) => {
                  try {
                    const res = await fetch(`/api/products/${p.id}`, {
                      cache: "no-store",
                    });

                    const fullProduct = await res.json();

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

        {/* ===================== EMPTY LIST ===================== */}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-6">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      {/* ===================== MODAL EDIT ===================== */}
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


