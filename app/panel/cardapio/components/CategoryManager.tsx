"use client";

import { useState } from "react";
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

import { apiFetch } from "@/lib/api";

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
  const sensors = useSensors(useSensor(PointerSensor));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // ========================================================
  // NORMALIZE
  // ========================================================
  function normalizeCategory(cat: any) {
    if (!cat) return cat;

    return {
      ...cat,
      products: Array.isArray(cat.products)
        ? cat.products.map((p: any, idx: number) => ({
            id: p.id,
            name: p.name ?? "",
            price: p.price ?? 0,
            description: p.description ?? null,
            imageUrl: p.imageUrl ?? null,
            active: p.active ?? true,
            order: p.order ?? idx,
            ...p,
          }))
        : [],
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
        body: JSON.stringify({ name }),
      });

      const created = normalizeCategory(data);

      setCategories((prev: any[]) => [...prev, created]);
      onSelectCategory(created.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria");
    }
  }

  // ========================================================
  // EDIT
  // ========================================================
  async function handleSaveCategory(updated: any) {
    try {
      await apiFetch("/categories", {
  method: "PATCH",
  body: JSON.stringify({
    id: updated.id,
    name: updated.name,
  }),
});


      setCategories((prev: any[]) =>
        prev.map((c: any) =>
          c.id === updated.id ? { ...c, name: updated.name } : c
        )
      );

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar categoria");
    }
  }

  // ========================================================
  // TOGGLE ACTIVE
  // ========================================================
  async function handleToggleActive(id: string) {
    const current = categories.find((c: any) => c.id === id);
    if (!current) return;

    const newActive = !current.active;

    setCategories((prev: any[]) =>
      prev.map((c: any) =>
        c.id === id ? { ...c, active: newActive } : c
      )
    );

    try {
      await apiFetch(`/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: newActive }),
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status");
    }
  }

  // ========================================================
  // DELETE
  // ========================================================
  async function handleDelete(id: string) {
    if (!confirm("Excluir essa categoria?")) return;

    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });

      setCategories((prev: any[]) => prev.filter((c) => c.id !== id));

      if (selectedCategoryId === id) {
        onSelectCategory(null);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir categoria");
    }
  }

  // ========================================================
  // DUPLICATE
  // ========================================================
  async function handleDuplicate(id: string) {
    const cat = categories.find((c: any) => c.id === id);
    if (!cat) return;

    try {
      const payload = {
        name: `${cat.name} (cópia)`,
        products: (cat.products || []).map((p: any) => ({
          name: p.name,
          price: p.price,
          description: p.description,
          imageUrl: p.imageUrl ?? null,
          active: p.active,
          order: p.order,
        })),
      };

      const createdRaw = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created = normalizeCategory(createdRaw);

      setCategories((prev: any[]) => [...prev, created]);
      onSelectCategory(created.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao duplicar categoria");
    }
  }

  // ========================================================
  // DRAG
  // ========================================================
  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev: any[]) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
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
        method: "POST",
        body: JSON.stringify({ orders }),
      });

      alert("Ordem salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar ordem");
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
                onSelect={onSelectCategory}
                onToggle={handleToggleActive}
                onEdit={() => {
                  setEditingCategory(cat);
                  setModalOpen(true);
                }}
                onDelete={() => handleDelete(cat.id)}
                onDuplicate={handleDuplicate}
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
      />
    </div>
  );
}
