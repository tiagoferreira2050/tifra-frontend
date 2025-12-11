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

// 🔥 IMPORT NECESSÁRIO PARA BUSCAR O PRODUTO COMPLETO
import { dbLoadAll } from "../storage/db";

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

  // Categoria selecionada
  const selectedCategory = categories.find(
    (c: any) => c.id === selectedCategoryId
  );

  // Produtos daquela categoria
  const products = selectedCategory?.products ?? [];

  // Filtro de busca
  const filtered = products.filter((p: any) =>
    (p.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  // Atualiza produtos na categoria
  function updateProducts(newList: any[]) {
    setCategories((prev: any[]) =>
      prev.map((c: any) =>
        c.id === selectedCategoryId ? { ...c, products: newList } : c
      )
    );
  }

  // Salva produto editado
  function handleSaveEditedProduct(updated: any) {
    updateProducts(
      products.map((p: any) => (p.id === updated.id ? updated : p))
    );

    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
  }

  // Sensores do drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Reordena produtos
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

                // 🟢 Toggle ativo/desativo
                onToggle={async () => {
                  const newActive = !prod.active;

                  updateProducts(
                    products.map((p: any) =>
                      p.id === prod.id ? { ...p, active: newActive } : p
                    )
                  );

                  await fetch(`/api/products/${prod.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ active: newActive }),
                  });
                }}

                // 🟢 EXCLUIR PRODUTO
                onDelete={async () => {
                  // atualiza UI
                  updateProducts(products.filter((p: any) => p.id !== prod.id));

                  // remove do banco
                  await fetch(`/api/products/${prod.id}`, {
                    method: "DELETE",
                  });
                }}

                // 🟢 Editar Produto
                onEdit={async (p: any) => {
                  try {
                    const fullProducts = (await dbLoadAll("products")) as any[];

                    const dbProd =
                      fullProducts.find((prod: any) => prod.id === p.id) || null;

                    let merged = {
                      ...(dbProd || {}),
                      ...(p || {}),
                    };

                    const dbHasComplements =
                      Array.isArray(dbProd?.complements) &&
                      dbProd.complements.length > 0;

                    const pHasComplements =
                      Array.isArray(p?.complements) &&
                      p.complements.length > 0;

                    if (dbHasComplements) {
                      merged.complements = dbProd.complements;
                    } else if (pHasComplements) {
                      merged.complements = p.complements;
                    } else {
                      merged.complements =
                        dbProd?.complements || p?.complements || [];
                    }

                    if (Array.isArray(merged.complements)) {
                      merged = {
                        ...merged,
                        complements: merged.complements.map(
                          (c: any, index: number) => ({
                            complementId: c.complementId || c.id || c,
                            active: c.active ?? true,
                            order: c.order ?? index,
                          })
                        ),
                      };
                    }

                    setEditingProduct(merged);
                    setEditOpen(true);
                  } catch (err) {
                    console.error("Erro ao carregar produto completo:", err);

                    const fallback = { ...p };

                    if (Array.isArray(fallback.complements)) {
                      fallback.complements = fallback.complements.map(
                        (c: any, idx: number) => ({
                          complementId: c.complementId || c.id || c,
                          active: c.active ?? true,
                          order: c.order ?? idx,
                        })
                      );
                    }

                    setEditingProduct(fallback);
                    setEditOpen(true);
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
  complements={complements}   // 🔥 CORREÇÃO AQUI
  onSave={handleSaveEditedProduct}
      />
    </>
  );
}
