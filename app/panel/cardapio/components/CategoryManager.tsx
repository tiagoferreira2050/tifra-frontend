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

  // ========================================================
  // CREATE
  // ========================================================
  async function handleCreate() {
    const name = prompt("Nome da categoria:");
    if (!name) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          storeId: STORE_ID,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Erro ao criar categoria!");
        return;
      }

      const newCat = {
        id: data.id,
        name: data.name,
        active: true,
        products: [],
      };

      setCategories((prev: any[]) => [...prev, newCat]);
      onSelectCategory(newCat.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria (servidor)");
    }
  }

  // ========================================================
  // EDIT (ABRIR MODAL)
  // ========================================================
  function handleEdit(category: any) {
    setEditingCategory(category);
    setIsNew(false);
    setModalOpen(true);
  }

  // ========================================================
  // EDITAR & SALVAR (NOME)
  // ========================================================
  async function handleSaveCategory(updated: any) {
    try {
      await fetch(`/api/categories/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
    setCategories((prev: any[]) => {
      const updated = prev.map((c: any) =>
        c.id === id ? { ...c, active: !c.active } : c
      );

      const changed = updated.find((c: any) => c.id === id);
      if (changed) {
        fetch(`/api/categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: changed.active }),
        }).catch((err) => console.error("Erro ao atualizar categoria:", err));
      }

      return updated;
    });
  }

  // ========================================================
  // DRAG AND DROP ORDER
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
  // SAVE ORDER NO BANCO
  // ========================================================
  async function handleSaveOrder() {
    try {
      const orders = categories.map((c: any, index: number) => ({
        id: c.id,
        order: index,
      }));

      await fetch("/api/categories/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Erro ao excluir categoria!");
        return;
      }

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
  // DUPLICATE (CORRIGIDO)
  // ========================================================
  async function duplicateCategory(cat: any) {
    try {
      const payload = {
        name: `${cat.name} (cópia)`,
        active: cat.active ?? true,
        storeId: STORE_ID,
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Erro ao duplicar categoria", await res.text());
        return;
      }

      const created = await res.json();

      setCategories((prev: any[]) => [...prev, created]);
      onSelectCategory(created.id);
    } catch (err) {
      console.error("Erro ao duplicar categoria:", err);
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

      {/* 🔥 SALVA NO BACKEND */}
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
                onEdit={() => handleEdit(cat)}
                onDelete={() => handleDelete(cat.id)}
                onDuplicate={() => duplicateCategory(cat)} 
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
