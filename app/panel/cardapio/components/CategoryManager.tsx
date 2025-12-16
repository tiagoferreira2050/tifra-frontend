"use client";

import CategoryItem from "./CategoryItem";
import EditCategoryModal from "./EditCategoryModal";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useState } from "react";
import { apiFetch } from "@/lib/api"; // 🔥 ÚNICA ADIÇÃO

export default function CategoryManager({
  categories,
  setCategories,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: any[];
  setCategories: (fn: any) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}) {
  const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
  const sensors = useSensors(useSensor(PointerSensor));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  function normalizeCategory(cat: any) {
    if (!cat) return cat;

    const normProducts = Array.isArray(cat.products)
      ? cat.products.map((p: any, idx: number) => ({
          id: p.id,
          name: p.name ?? "",
          price: p.price ?? 0,
          description: p.description ?? null,
          imageUrl: p.imageUrl ?? p.image ?? null,
          active: p.active === undefined ? true : p.active,
          order: p.order ?? idx,
          ...Object.keys(p).reduce((acc: any, k: string) => {
            if (
              ![
                "id",
                "name",
                "price",
                "description",
                "imageUrl",
                "image",
                "active",
                "order",
              ].includes(k)
            ) {
              acc[k] = p[k];
            }
            return acc;
          }, {}),
        }))
      : [];

    return {
      ...cat,
      products: normProducts,
    };
  }

  // ========================================================
  // CREATE
  // ========================================================
  async function handleCreate() {
    const name = prompt("Nome da categoria:");
    if (!name) return;

    try {
      const data = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          name,
          storeId: STORE_ID,
        }),
      });

      const newCat = normalizeCategory({
        id: data.id,
        name: data.name,
        active: true,
        products: data.products ?? [],
      });

      setCategories((prev: any[]) => [...prev, newCat]);
      onSelectCategory(newCat.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria (servidor)");
    }
  }

  // ========================================================
  // EDITAR NOME
  // ========================================================
  async function handleSaveCategory(updated: any) {
    try {
      await apiFetch(`/categories/${updated.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: updated.name }),
      });

      setCategories((prev: any[]) =>
        prev.map((c: any) =>
          c.id === updated.id ? { ...c, name: updated.name } : c
        )
      );

      setEditingCategory(updated);
      setModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      alert("Erro ao salvar categoria");
    }
  }

  // ========================================================
  // TOGGLE ACTIVE
  // ========================================================
  async function toggleActive(id: string) {
    setCategories((prev: any[]) =>
      prev.map((c: any) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );

    const found = categories.find((c: any) => c.id === id);
    const newActive = found ? !found.active : false;

    try {
      await apiFetch(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: newActive }),
      });
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
    }
  }

  // ========================================================
  // DRAG AND DROP
  // ========================================================
  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setCategories((prev: any[]) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // ========================================================
  // SAVE ORDER
  // ========================================================
  async function handleSaveOrder() {
    try {
      const orders = categories.map((c: any, index: number) => ({
        id: c.id,
        order: index,
      }));

      await apiFetch("/categories/order", {
        method: "PUT",
        body: JSON.stringify({ orders }),
      });

      alert("Ordem salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar ordem:", err);
      alert("Erro ao salvar ordem");
    }
  }

  // ========================================================
  // DELETE
  // ========================================================
  async function handleDelete(id: string) {
    if (!confirm("Excluir essa categoria?")) return;

    try {
      await apiFetch(`/categories/${id}`, {
        method: "DELETE",
      });

      setCategories((prev: any[]) => prev.filter((c) => c.id !== id));

      if (selectedCategoryId === id) {
        onSelectCategory(null);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir categoria (servidor)");
    }
  }

  // ========================================================
  // DUPLICATE
  // ========================================================
  async function handleDuplicate(cat: any) {
    try {
      const payload = {
        name: `${cat.name} (cópia)`,
        storeId: STORE_ID,
        products: (cat.products || []).map((p: any) => ({
          name: p.name,
          price: p.price,
          description: p.description,
          imageUrl: p.imageUrl ?? p.image ?? null,
          active: p.active,
          order: p.order,
        })),
      };

      const createdRaw = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created = normalizeCategory({
        id: createdRaw.id,
        name: createdRaw.name,
        active: createdRaw.active ?? true,
        products: createdRaw.products ?? payload.products ?? [],
      });

      setCategories((prev: any[]) => [...prev, created]);
      onSelectCategory(created.id);
    } catch (err) {
      console.error("Erro ao duplicar categoria:", err);
      alert("Erro ao duplicar categoria");
    }
  }

  // ========================================================
  // UI
  // ========================================================
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>

        <button
          onClick={handleCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          + Nova categoria
        </button>
      </div>

      <button
        onClick={handleSaveOrder}
        className="bg-green-600 w-full text-white py-2 rounded-md font-medium"
      >
        Salvar Ordem
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {categories.map((cat: any) => (
              <CategoryItem
                key={cat.id}
                id={cat.id}
                name={cat.name}
                active={cat.active}
                isSelected={selectedCategoryId === cat.id}
                onSelect={() => onSelectCategory(cat.id)}
                onToggle={toggleActive}
                onEdit={() => {
                  setEditingCategory(cat);
                  setModalOpen(true);
                }}
                onDelete={() => handleDelete(cat.id)}
                onDuplicate={() => handleDuplicate(cat)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <EditCategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSave={handleSaveCategory}
        isNew={isNew}
      />
    </div>
  );
}
