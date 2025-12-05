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

import { dbSave, dbDelete } from "../storage/db";

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
          storeId: process.env.NEXT_PUBLIC_STORE_ID,
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
  // TOGGLE ACTIVE
  // ========================================================
  function toggleActive(id: string) {
    setCategories((prev: any[]) => {
      const next = prev.map((c: any) =>
        c.id === id ? { ...c, active: !c.active } : c
      );

      const updated = next.find((c: any) => c.id === id);
      if (updated) dbSave("categories", updated);

      return next;
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
        const next = arrayMove(prev, oldIndex, newIndex);

        next.forEach((cat) => dbSave("categories", cat));
        return next;
      });
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
  // SAVE (PUT)
  // ========================================================
  async function handleSave(updated: any) {
    try {
      const res = await fetch(`/api/categories/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          active: updated.active,
        }),
      });

      if (!res.ok) {
        alert("Erro ao atualizar categoria!");
        return;
      }

      const data = await res.json();

      setCategories((prev: any[]) =>
        prev.map((c: any) => (c.id === data.id ? data : c))
      );

      setModalOpen(false);

    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar categoria (servidor)");
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
  // DUPLICATE
  // ========================================================
  function handleDuplicate(cat: any) {
    const newCat = {
      ...cat,
      id: String(Date.now()),
      name: cat.name + " (cópia)",
      products: cat.products ? [...cat.products] : [],
    };

    setCategories((prev: any[]) => [...prev, newCat]);
    onSelectCategory(newCat.id);

    dbSave("categories", newCat);
  }

  // ========================================================
  // SAVE ORDER (LOCAL)
  // ========================================================
  function saveOrder() {
    try {
      const simple = categories.map((c) => ({ id: c.id, name: c.name }));
      localStorage.setItem("categories_order", JSON.stringify(simple));
      alert("Ordem salva localmente. Depois podemos mandar para API.");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar ordem.");
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
        onClick={saveOrder}
        className="bg-green-600 w-full text-white py-2 rounded-md font-medium"
      >
        Salvar Ordem
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
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
        onSave={handleSave}
        isNew={isNew}
      />
    </div>
  );
}
