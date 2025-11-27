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
                onToggle={() =>
                  updateProducts(
                    products.map((p: any) =>
                      p.id === prod.id ? { ...p, active: !p.active } : p
                    )
                  )
                }
                onDelete={() =>
                  updateProducts(products.filter((p: any) => p.id !== prod.id))
                }

                // ⭐⭐⭐ CORREÇÃO: BUSCA DO DB + MERGE + NORMALIZAÇÃO DOS COMPLEMENTS ⭐⭐⭐
                onEdit={async (p: any) => {
                  try {
                    const fullProducts = await dbLoadAll("products");

                    // produto vindo do db (pode estar desatualizado ou sem complements)
                    const dbProd =
                      fullProducts.find((prod: any) => prod.id === p.id) || null;

                    // Faz merge: prefere campos do dbProd, mas usa p como fallback (principalmente complements)
                    // Isso evita perder complements que existam em memória
                    let merged = {
                      ...(dbProd || {}),
                      ...(p || {}),
                    };

                    // Garantir que merged tenha complements: prefer dbProd.complements se existir e tiver length,
                    // senão usa p.complements. (Se ambos ausentes, fica undefined --> modal lidará)
                    const dbHasComplements = Array.isArray(dbProd?.complements) && dbProd.complements.length > 0;
                    const pHasComplements = Array.isArray(p?.complements) && p.complements.length > 0;

                    if (dbHasComplements) {
                      merged.complements = dbProd.complements;
                    } else if (pHasComplements) {
                      merged.complements = p.complements;
                    } else {
                      merged.complements = dbProd?.complements || p?.complements || [];
                    }

                    // Normaliza qualquer formato de complement salvo para:
                    // { complementId, active, order }
                    if (Array.isArray(merged.complements)) {
                      merged = {
                        ...merged,
                        complements: merged.complements.map((c: any, index: number) => ({
                          complementId: c.complementId || c.id || c, // aceita string id também
                          active: c.active ?? true,
                          order: c.order ?? index,
                        })),
                      };
                    }

                    setEditingProduct(merged);
                    setEditOpen(true);
                  } catch (err) {
                    console.error("Erro ao carregar produto completo:", err);

                    // fallback seguro: usa p (produto da lista) e tenta normalizar complements
                    const fallback = { ...p };
                    if (Array.isArray(fallback.complements)) {
                      fallback.complements = fallback.complements.map((c: any, idx: number) => ({
                        complementId: c.complementId || c.id || c,
                        active: c.active ?? true,
                        order: c.order ?? idx,
                      }));
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
  onSave={handleSaveEditedProduct}
  globalComplements={complements}
/>
    </>
  );
}
